import { isUndefined } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-audio-field-universal-identifier';
import { CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-video-field-universal-identifier';
import { extractRecallMediaUrls } from 'src/logic-functions/recall-api/extract-recall-media-urls.util';
import { getRecallRecording } from 'src/logic-functions/recall-api/get-recall-recording.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

type CallRecordingMediaUpdateFields = Pick<
  CallRecordingUpdateFields,
  'audio' | 'video'
>;

type CallRecordingMediaArtifactIngestionResult =
  | {
      outcome: 'uploaded';
      updateData: CallRecordingMediaUpdateFields;
    }
  | {
      outcome:
        | 'already-present'
        | 'failed'
        | 'missing-url'
        | 'recording-fetch-failed'
        | 'size-unavailable'
        | 'too-large';
    };

const MEDIA_DOWNLOAD_TIMEOUT_MS = 120_000;
// TODO: Remove this buffered-upload guard once core supports streaming Recall URLs directly into file-field storage.
const MAX_BUFFERED_MEDIA_FILE_SIZE_BYTES = 100 * 1024 * 1024;

class BufferedMediaFileSizeLimitError extends Error {
  constructor(
    message: string,
    public readonly outcome: 'size-unavailable' | 'too-large',
  ) {
    super(message);
  }
}

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
  const updateFields: CallRecordingMediaUpdateFields = {};

  if (!hasVideo && !isUndefined(mediaUrls.videoUrl)) {
    const videoResult = await ingestMediaArtifact({
      callRecordingId,
      metadataClient,
      url: mediaUrls.videoUrl,
      fileName: 'video.mp4',
      fieldMetadataUniversalIdentifier:
        CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER,
      fieldName: 'video',
    });

    if (videoResult.outcome === 'uploaded') {
      Object.assign(updateFields, videoResult.updateData);
    }
  }

  if (!hasAudio && !isUndefined(mediaUrls.audioUrl)) {
    const audioResult = await ingestMediaArtifact({
      callRecordingId,
      metadataClient,
      url: mediaUrls.audioUrl,
      fileName: 'audio.mp3',
      fieldMetadataUniversalIdentifier:
        CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER,
      fieldName: 'audio',
    });

    if (audioResult.outcome === 'uploaded') {
      Object.assign(updateFields, audioResult.updateData);
    }
  }

  return updateFields;
};

export const ingestCallRecordingVideo = async ({
  callRecordingId,
  externalRecordingId,
  hasVideo,
}: {
  callRecordingId: string;
  externalRecordingId: string;
  hasVideo: boolean;
}): Promise<CallRecordingMediaArtifactIngestionResult> => {
  if (hasVideo) {
    return { outcome: 'already-present' };
  }

  const recordingResult = await getRecallRecording({ externalRecordingId });

  if (!recordingResult.ok) {
    console.warn(
      `[call-recorder] failed to fetch Recall recording ${externalRecordingId} while ingesting video for call recording ${callRecordingId}: ${recordingResult.errorMessage}`,
    );

    return { outcome: 'recording-fetch-failed' };
  }

  const mediaUrls = extractRecallMediaUrls(recordingResult.recording);

  if (isUndefined(mediaUrls.videoUrl)) {
    return { outcome: 'missing-url' };
  }

  return ingestMediaArtifact({
    callRecordingId,
    metadataClient: new MetadataApiClient(),
    url: mediaUrls.videoUrl,
    fileName: 'video.mp4',
    fieldMetadataUniversalIdentifier:
      CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER,
    fieldName: 'video',
  });
};

export const ingestCallRecordingAudio = async ({
  callRecordingId,
  externalRecordingId,
  hasAudio,
}: {
  callRecordingId: string;
  externalRecordingId: string;
  hasAudio: boolean;
}): Promise<CallRecordingMediaArtifactIngestionResult> => {
  if (hasAudio) {
    return { outcome: 'already-present' };
  }

  const recordingResult = await getRecallRecording({ externalRecordingId });

  if (!recordingResult.ok) {
    console.warn(
      `[call-recorder] failed to fetch Recall recording ${externalRecordingId} while ingesting audio for call recording ${callRecordingId}: ${recordingResult.errorMessage}`,
    );

    return { outcome: 'recording-fetch-failed' };
  }

  const mediaUrls = extractRecallMediaUrls(recordingResult.recording);

  if (isUndefined(mediaUrls.audioUrl)) {
    return { outcome: 'missing-url' };
  }

  return ingestMediaArtifact({
    callRecordingId,
    metadataClient: new MetadataApiClient(),
    url: mediaUrls.audioUrl,
    fileName: 'audio.mp3',
    fieldMetadataUniversalIdentifier:
      CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER,
    fieldName: 'audio',
  });
};

const ingestMediaArtifact = async ({
  callRecordingId,
  metadataClient,
  url,
  fileName,
  fieldMetadataUniversalIdentifier,
  fieldName,
}: {
  callRecordingId: string;
  metadataClient: InstanceType<typeof MetadataApiClient>;
  url: string;
  fileName: string;
  fieldMetadataUniversalIdentifier: string;
  fieldName: keyof CallRecordingMediaUpdateFields;
}): Promise<CallRecordingMediaArtifactIngestionResult> => {
  try {
    const { buffer, contentType } = await downloadMediaFile({
      callRecordingId,
      fileName,
      url,
    });

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
      outcome: 'uploaded',
      updateData: {
        [fieldName]: [{ fileId: uploadedFile.id, label: fileName }],
      },
    };
  } catch (error) {
    if (error instanceof BufferedMediaFileSizeLimitError) {
      console.warn(
        `[call-recorder] skipped ${fileName} for call recording ${callRecordingId}: ${error.message}`,
      );

      return { outcome: error.outcome };
    }

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
}: {
  callRecordingId: string;
  fileName: string;
  url: string;
}): Promise<{ buffer: Buffer; contentType: string }> => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(MEDIA_DOWNLOAD_TIMEOUT_MS),
  });
  const contentType =
    response.headers.get('content-type') ?? 'application/octet-stream';
  const contentLength = response.headers.get('content-length') ?? 'unknown';

  console.log(
    `[call-recorder] media-ingestion phase=artifact-download-response callRecordingId=${callRecordingId} fileName=${fileName} responseStatus=${response.status} contentLengthBytes=${contentLength} contentType=${contentType} ${formatMemoryUsageForLog()}`,
  );

  if (!response.ok) {
    throw new Error(`download failed with status ${response.status}`);
  }

  assertMediaFileCanBeBuffered(response.headers);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
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

const assertMediaFileCanBeBuffered = (headers: Headers): void => {
  const contentLengthHeader = headers.get('content-length');

  if (contentLengthHeader === null) {
    throw new BufferedMediaFileSizeLimitError(
      'content length is unavailable for the buffered upload path',
      'size-unavailable',
    );
  }

  const contentLengthBytes = Number(contentLengthHeader);

  if (
    !Number.isFinite(contentLengthBytes) ||
    contentLengthBytes < 0 ||
    contentLengthBytes > MAX_BUFFERED_MEDIA_FILE_SIZE_BYTES
  ) {
    throw new BufferedMediaFileSizeLimitError(
      `content length ${contentLengthHeader} exceeds the buffered upload limit of ${MAX_BUFFERED_MEDIA_FILE_SIZE_BYTES} bytes`,
      'too-large',
    );
  }
};
