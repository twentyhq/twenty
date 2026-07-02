import { isNull, isUndefined } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-audio-field-universal-identifier';
import { CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-video-field-universal-identifier';
import { getMaxMediaFileSizeBytes } from 'src/logic-functions/constants/get-max-media-file-size-bytes';
import {
  AUDIO_FILE_TOO_LARGE_FAILURE_REASON,
  VIDEO_FILE_TOO_LARGE_FAILURE_REASON,
} from 'src/logic-functions/constants/media-file-too-large-failure-reasons';
import { extractRecallMediaUrls } from 'src/logic-functions/recall-api/extract-recall-media-urls.util';
import { getRecallRecording } from 'src/logic-functions/recall-api/get-recall-recording.util';
import { type CallRecordingMediaFile } from 'src/logic-functions/types/call-recording-media-file.type';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type CallRecordingMediaUpdateFields = Pick<
  CallRecordingUpdateFields,
  'audio' | 'video' | 'callRecorderFailureReason'
>;

type IngestMediaArtifactResult =
  | { outcome: 'ingested'; files: CallRecordingMediaFile[] }
  | { outcome: 'too-large' }
  | { outcome: 'failed' };

type DownloadMediaFileResult =
  | { outcome: 'downloaded'; buffer: Buffer; contentType: string }
  | { outcome: 'too-large'; sizeBytes: number | undefined };

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
}): Promise<CallRecordingMediaUpdateFields> => {
  if (hasAudio && hasVideo) {
    return {};
  }

  const recordingResult = await getRecallRecording({ externalRecordingId });

  if (!recordingResult.ok) {
    console.warn(
      `[call-recorder] failed to fetch Recall recording ${externalRecordingId} while ingesting media for call recording ${callRecordingId}: ${recordingResult.errorMessage}`,
    );

    return {};
  }

  const mediaUrls = extractRecallMediaUrls(recordingResult.recording);
  const metadataClient = new MetadataApiClient();
  // TODO: drop the size cap once core streams uploads without buffering whole files in memory.
  const maxMediaFileSizeBytes = getMaxMediaFileSizeBytes();
  const updateFields: CallRecordingMediaUpdateFields = {};
  const tooLargeFailureReasons: string[] = [];

  if (!hasVideo && !isUndefined(mediaUrls.videoUrl)) {
    const video = await ingestMediaArtifact({
      callRecordingId,
      metadataClient,
      url: mediaUrls.videoUrl,
      fileName: 'video.mp4',
      fieldMetadataUniversalIdentifier:
        CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER,
      maxMediaFileSizeBytes,
    });

    if (video.outcome === 'ingested') {
      updateFields.video = video.files;
    }

    if (video.outcome === 'too-large') {
      tooLargeFailureReasons.push(VIDEO_FILE_TOO_LARGE_FAILURE_REASON);
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
      maxMediaFileSizeBytes,
    });

    if (audio.outcome === 'ingested') {
      updateFields.audio = audio.files;
    }

    if (audio.outcome === 'too-large') {
      tooLargeFailureReasons.push(AUDIO_FILE_TOO_LARGE_FAILURE_REASON);
    }
  }

  if (tooLargeFailureReasons.length > 0) {
    updateFields.callRecorderFailureReason = tooLargeFailureReasons.join(',');
  }

  return updateFields;
};

const ingestMediaArtifact = async ({
  callRecordingId,
  metadataClient,
  url,
  fileName,
  fieldMetadataUniversalIdentifier,
  maxMediaFileSizeBytes,
}: {
  callRecordingId: string;
  metadataClient: InstanceType<typeof MetadataApiClient>;
  url: string;
  fileName: string;
  fieldMetadataUniversalIdentifier: string;
  maxMediaFileSizeBytes: number;
}): Promise<IngestMediaArtifactResult> => {
  try {
    const downloadResult = await downloadMediaFile({
      callRecordingId,
      fileName,
      url,
      maxMediaFileSizeBytes,
    });

    if (downloadResult.outcome === 'too-large') {
      console.warn(
        `[call-recorder] media-ingestion phase=artifact-too-large callRecordingId=${callRecordingId} fileName=${fileName} sizeBytes=${downloadResult.sizeBytes ?? 'unknown'} maxMediaFileSizeBytes=${maxMediaFileSizeBytes}`,
      );

      return { outcome: 'too-large' };
    }

    const { buffer, contentType } = downloadResult;

    console.log(
      `[call-recorder] media-ingestion phase=artifact-upload-start callRecordingId=${callRecordingId} fileName=${fileName} downloadedBytes=${buffer.byteLength} contentType=${contentType} ${formatMemoryUsageForLog()}`,
    );

    const uploadedFile = await metadataClient.uploadFile(
      buffer,
      fileName,
      contentType,
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
  maxMediaFileSizeBytes,
}: {
  callRecordingId: string;
  fileName: string;
  url: string;
  maxMediaFileSizeBytes: number;
}): Promise<DownloadMediaFileResult> => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(MEDIA_DOWNLOAD_TIMEOUT_MS),
  });
  const contentType =
    response.headers.get('content-type') ?? 'application/octet-stream';
  const contentLengthBytes = parseContentLengthBytes(
    response.headers.get('content-length'),
  );

  console.log(
    `[call-recorder] media-ingestion phase=artifact-download-response callRecordingId=${callRecordingId} fileName=${fileName} responseStatus=${response.status} contentLengthBytes=${contentLengthBytes ?? 'unknown'} contentType=${contentType} ${formatMemoryUsageForLog()}`,
  );

  if (!response.ok) {
    throw new Error(`download failed with status ${response.status}`);
  }

  if (
    !isUndefined(contentLengthBytes) &&
    contentLengthBytes > maxMediaFileSizeBytes
  ) {
    await response.body?.cancel();

    return { outcome: 'too-large', sizeBytes: contentLengthBytes };
  }

  if (isNull(response.body)) {
    throw new Error('download returned no body');
  }

  return readBodyWithinSizeCap({
    body: response.body,
    contentType,
    maxMediaFileSizeBytes,
  });
};

const readBodyWithinSizeCap = async ({
  body,
  contentType,
  maxMediaFileSizeBytes,
}: {
  body: ReadableStream<Uint8Array>;
  contentType: string;
  maxMediaFileSizeBytes: number;
}): Promise<DownloadMediaFileResult> => {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let downloadedBytes = 0;

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    downloadedBytes += value.byteLength;

    if (downloadedBytes > maxMediaFileSizeBytes) {
      await reader.cancel();

      return { outcome: 'too-large', sizeBytes: undefined };
    }

    chunks.push(value);
  }

  return {
    outcome: 'downloaded',
    buffer: Buffer.concat(chunks),
    contentType,
  };
};

const parseContentLengthBytes = (
  headerValue: string | null,
): number | undefined => {
  if (!isNonEmptyString(headerValue)) {
    return undefined;
  }

  const parsedBytes = Number(headerValue.trim());

  return Number.isFinite(parsedBytes) && parsedBytes >= 0
    ? parsedBytes
    : undefined;
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
