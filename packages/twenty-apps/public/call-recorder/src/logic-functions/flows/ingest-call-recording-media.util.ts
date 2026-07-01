import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-audio-field-universal-identifier';
import { CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-video-field-universal-identifier';
import { CALL_RECORDER_MEDIA_TOO_LARGE_FAILURE_REASON } from 'src/logic-functions/constants/call-recorder-media-too-large-failure-reason';
import { getMaxMediaBytes } from 'src/logic-functions/domain/get-max-media-bytes.util';
import { type MediaIngestionUpdate } from 'src/logic-functions/flows/merge-media-ingestion-update.util';
import { extractRecallMediaUrls } from 'src/logic-functions/recall-api/extract-recall-media-urls.util';
import { getRecallRecording } from 'src/logic-functions/recall-api/get-recall-recording.util';
import { type CallRecordingMediaFile } from 'src/logic-functions/types/call-recording-media-file.type';

type CallRecordingMediaUpdateFields = MediaIngestionUpdate;

export type CallRecordingMediaIngestionResult = {
  updateFields: CallRecordingMediaUpdateFields;
  // Artifacts actually pulled into memory this call, excluding pre-download size skips
  // (which buffer nothing). Lets a caller budget how many large buffers a run allocates.
  downloadedArtifactCount: number;
};

type IngestMediaArtifactResult =
  | { outcome: 'ingested'; files: CallRecordingMediaFile[] }
  | { outcome: 'skipped-too-large' }
  | { outcome: 'failed' };

type DownloadMediaFileResult =
  | { outcome: 'downloaded'; buffer: Buffer; contentType: string }
  | { outcome: 'skipped-too-large'; contentLengthBytes: number };

const MEDIA_DOWNLOAD_TIMEOUT_MS = 120_000;

export const ingestCallRecordingMedia = async ({
  callRecordingId,
  externalRecordingId,
  hasAudio,
  hasVideo,
}: {
  callRecordingId: string;
  externalRecordingId: string;
  hasAudio: boolean;
  hasVideo: boolean;
}): Promise<CallRecordingMediaIngestionResult> => {
  if (hasAudio && hasVideo) {
    return { updateFields: {}, downloadedArtifactCount: 0 };
  }

  const recordingResult = await getRecallRecording({ externalRecordingId });

  if (!recordingResult.ok) {
    console.warn(
      `[call-recorder] failed to fetch Recall recording ${externalRecordingId} while ingesting media for call recording ${callRecordingId}: ${recordingResult.errorMessage}`,
    );

    return { updateFields: {}, downloadedArtifactCount: 0 };
  }

  const mediaUrls = extractRecallMediaUrls(recordingResult.recording);
  const metadataClient = new MetadataApiClient();
  const maxBytes = getMaxMediaBytes();
  const updateFields: CallRecordingMediaUpdateFields = {};
  const skippedTooLargeArtifacts: string[] = [];
  let downloadedArtifactCount = 0;

  if (!hasVideo && !isUndefined(mediaUrls.videoUrl)) {
    const video = await ingestMediaArtifact({
      callRecordingId,
      metadataClient,
      url: mediaUrls.videoUrl,
      fileName: 'video.mp4',
      fieldMetadataUniversalIdentifier:
        CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER,
      maxBytes,
    });

    if (video.outcome === 'skipped-too-large') {
      skippedTooLargeArtifacts.push('video.mp4');
    } else {
      downloadedArtifactCount += 1;

      if (video.outcome === 'ingested') {
        updateFields.video = video.files;
      }
    }
  }

  if (!hasAudio && !isUndefined(mediaUrls.audioUrl)) {
    const audio = await ingestMediaArtifact({
      callRecordingId,
      metadataClient,
      url: mediaUrls.audioUrl,
      fileName: 'audio.mp3',
      fieldMetadataUniversalIdentifier:
        CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER,
      maxBytes,
    });

    if (audio.outcome === 'skipped-too-large') {
      skippedTooLargeArtifacts.push('audio.mp3');
    } else {
      downloadedArtifactCount += 1;

      if (audio.outcome === 'ingested') {
        updateFields.audio = audio.files;
      }
    }
  }

  // A skipped artifact keeps the recording out of the "complete" state, so this reason
  // persists (it is only stripped on completion) and the recording stays a convergence
  // candidate: raising the ceiling later lets a subsequent run finish ingestion.
  if (isNonEmptyArray(skippedTooLargeArtifacts)) {
    updateFields.callRecorderFailureReason =
      CALL_RECORDER_MEDIA_TOO_LARGE_FAILURE_REASON;
  }

  return { updateFields, downloadedArtifactCount };
};

const ingestMediaArtifact = async ({
  callRecordingId,
  metadataClient,
  url,
  fileName,
  fieldMetadataUniversalIdentifier,
  maxBytes,
}: {
  callRecordingId: string;
  metadataClient: InstanceType<typeof MetadataApiClient>;
  url: string;
  fileName: string;
  fieldMetadataUniversalIdentifier: string;
  maxBytes: number;
}): Promise<IngestMediaArtifactResult> => {
  try {
    const downloadResult = await downloadMediaFile({
      callRecordingId,
      fileName,
      url,
      maxBytes,
    });

    if (downloadResult.outcome === 'skipped-too-large') {
      console.warn(
        `[call-recorder] media-ingestion phase=artifact-skipped-too-large callRecordingId=${callRecordingId} fileName=${fileName} contentLengthBytes=${downloadResult.contentLengthBytes} maxBytes=${maxBytes} ${formatMemoryUsageForLog()}`,
      );

      return { outcome: 'skipped-too-large' };
    }

    console.log(
      `[call-recorder] media-ingestion phase=artifact-upload-start callRecordingId=${callRecordingId} fileName=${fileName} downloadedBytes=${downloadResult.buffer.byteLength} contentType=${downloadResult.contentType} ${formatMemoryUsageForLog()}`,
    );

    const uploadedFile = await metadataClient.uploadFile(
      downloadResult.buffer,
      fileName,
      downloadResult.contentType,
      fieldMetadataUniversalIdentifier,
    );

    return {
      outcome: 'ingested',
      files: [{ fileId: uploadedFile.id, label: fileName }],
    };
  } catch (error) {
    console.warn(
      `[call-recorder] failed to ingest ${fileName} for call recording ${callRecordingId}: ${error instanceof Error ? error.message : String(error)}`,
    );

    return { outcome: 'failed' };
  }
};

const downloadMediaFile = async ({
  callRecordingId,
  fileName,
  url,
  maxBytes,
}: {
  callRecordingId: string;
  fileName: string;
  url: string;
  maxBytes: number;
}): Promise<DownloadMediaFileResult> => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(MEDIA_DOWNLOAD_TIMEOUT_MS),
  });
  const contentType =
    response.headers.get('content-type') ?? 'application/octet-stream';
  const contentLengthHeader = response.headers.get('content-length');

  console.log(
    `[call-recorder] media-ingestion phase=artifact-download-response callRecordingId=${callRecordingId} fileName=${fileName} responseStatus=${response.status} contentLengthBytes=${contentLengthHeader ?? 'unknown'} contentType=${contentType} ${formatMemoryUsageForLog()}`,
  );

  if (!response.ok) {
    throw new Error(`download failed with status ${response.status}`);
  }

  // Enforce the ceiling from Content-Length BEFORE reading the body: buffering the
  // whole artifact here (then copying it again into a Blob in uploadFile) is what
  // OOM-kills the 512MB executor. Recall serves Content-Length on media downloads.
  // Number(null) === 0, so a missing/blank header is treated as "unknown size" and
  // falls through to a best-effort download rather than being skipped.
  const contentLengthBytes = Number(contentLengthHeader);

  if (Number.isFinite(contentLengthBytes) && contentLengthBytes > maxBytes) {
    // Drop the connection without draining the body into memory.
    await response.body?.cancel();

    return { outcome: 'skipped-too-large', contentLengthBytes };
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    outcome: 'downloaded',
    buffer,
    contentType,
  };
};

const formatMemoryUsageForLog = (): string => {
  const memoryUsage = process.memoryUsage();

  return [
    `rssMegaBytes=${formatBytesAsMegaBytes(memoryUsage.rss)}`,
    `heapUsedMegaBytes=${formatBytesAsMegaBytes(memoryUsage.heapUsed)}`,
    `externalMegaBytes=${formatBytesAsMegaBytes(memoryUsage.external)}`,
    `arrayBuffersMegaBytes=${formatBytesAsMegaBytes(memoryUsage.arrayBuffers)}`,
  ].join(' ');
};

const formatBytesAsMegaBytes = (bytes: number): string =>
  (bytes / 1024 / 1024).toFixed(1);
