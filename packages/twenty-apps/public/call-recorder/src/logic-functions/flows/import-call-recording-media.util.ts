import { isNull, isUndefined } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-audio-field-universal-identifier';
import { CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-video-field-universal-identifier';
import { CALL_RECORDER_MAX_MEDIA_FILE_SIZE_BYTES } from 'src/logic-functions/constants/call-recorder-max-media-file-size-bytes';
import {
  AUDIO_FILE_TOO_LARGE_FAILURE_REASON,
  VIDEO_FILE_TOO_LARGE_FAILURE_REASON,
} from 'src/logic-functions/constants/media-file-too-large-failure-reasons';
import { putMediaDownloadBodyToUploadTarget } from 'src/logic-functions/flows/put-media-download-body-to-upload-target.util';
import { extractRecallMediaUrls } from 'src/logic-functions/recall-api/extract-recall-media-urls.util';
import { getRecallRecording } from 'src/logic-functions/recall-api/get-recall-recording.util';
import { type CallRecordingMediaFile } from 'src/logic-functions/types/call-recording-media-file.type';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type CallRecordingMediaUpdateFields = Pick<
  CallRecordingUpdateFields,
  'audio' | 'video' | 'callRecorderFailureReason'
>;

type ImportMediaArtifactResult =
  | { outcome: 'imported'; files: CallRecordingMediaFile[] }
  | { outcome: 'too-large' }
  | { outcome: 'failed' };

type OpenMediaDownloadResult =
  | { outcome: 'opened'; body: ReadableStream<Uint8Array>; sizeBytes: number }
  | { outcome: 'too-large'; sizeBytes: number };

type MediaUploadTarget = {
  fileId: string;
  uploadUrl: string;
  contentType: string;
};

const MEDIA_DOWNLOAD_TIMEOUT_MS = 120_000;
const MEDIA_FILE_FOLDER = 'FilesField';

const MEDIA_ARTIFACT_DESCRIPTORS = [
  {
    field: 'video',
    fileName: 'video.mp4',
    fieldMetadataUniversalIdentifier:
      CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER,
    tooLargeFailureReason: VIDEO_FILE_TOO_LARGE_FAILURE_REASON,
  },
  {
    field: 'audio',
    fileName: 'audio.mp3',
    fieldMetadataUniversalIdentifier:
      CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER,
    tooLargeFailureReason: AUDIO_FILE_TOO_LARGE_FAILURE_REASON,
  },
] as const;

export const importCallRecordingMedia = async ({
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
      `[call-recorder] failed to fetch Recall recording ${externalRecordingId} while importing media for call recording ${callRecordingId}: ${recordingResult.errorMessage}`,
    );

    return {};
  }

  const mediaUrls = extractRecallMediaUrls(recordingResult.recording);
  const metadataClient = new MetadataApiClient();
  const updateFields: CallRecordingMediaUpdateFields = {};
  const tooLargeFailureReasons: string[] = [];
  const artifactStateByField = {
    video: { alreadyImported: hasVideo, url: mediaUrls.videoUrl },
    audio: { alreadyImported: hasAudio, url: mediaUrls.audioUrl },
  };

  for (const descriptor of MEDIA_ARTIFACT_DESCRIPTORS) {
    const { alreadyImported, url } = artifactStateByField[descriptor.field];

    if (alreadyImported || isUndefined(url)) {
      continue;
    }

    const importResult = await importMediaArtifact({
      callRecordingId,
      metadataClient,
      url,
      fileName: descriptor.fileName,
      fieldMetadataUniversalIdentifier:
        descriptor.fieldMetadataUniversalIdentifier,
      maxMediaFileSizeBytes: CALL_RECORDER_MAX_MEDIA_FILE_SIZE_BYTES,
    });

    if (importResult.outcome === 'imported') {
      updateFields[descriptor.field] = importResult.files;
    }

    if (importResult.outcome === 'too-large') {
      tooLargeFailureReasons.push(descriptor.tooLargeFailureReason);
    }
  }

  if (tooLargeFailureReasons.length > 0) {
    updateFields.callRecorderFailureReason = tooLargeFailureReasons.join(',');
  }

  return updateFields;
};

const importMediaArtifact = async ({
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
}): Promise<ImportMediaArtifactResult> => {
  try {
    const download = await openMediaDownload({
      callRecordingId,
      fileName,
      url,
      maxMediaFileSizeBytes,
    });

    if (download.outcome === 'too-large') {
      console.warn(
        `[call-recorder] media-import phase=artifact-too-large callRecordingId=${callRecordingId} fileName=${fileName} sizeBytes=${download.sizeBytes} maxMediaFileSizeBytes=${maxMediaFileSizeBytes}`,
      );

      return { outcome: 'too-large' };
    }

    const fileId = await uploadMediaStreamToStorage({
      callRecordingId,
      metadataClient,
      fileName,
      fieldMetadataUniversalIdentifier,
      body: download.body,
      sizeBytes: download.sizeBytes,
    });

    return {
      outcome: 'imported',
      files: [{ fileId, label: fileName }],
    };
  } catch (error) {
    console.warn(
      `[call-recorder] failed to import ${fileName} for call recording ${callRecordingId}: ${error instanceof Error ? error.message : String(error)}`,
    );

    return { outcome: 'failed' };
  }
};

const openMediaDownload = async ({
  callRecordingId,
  fileName,
  url,
  maxMediaFileSizeBytes,
}: {
  callRecordingId: string;
  fileName: string;
  url: string;
  maxMediaFileSizeBytes: number;
}): Promise<OpenMediaDownloadResult> => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(MEDIA_DOWNLOAD_TIMEOUT_MS),
  });
  const contentLengthBytes = parseContentLengthBytes(
    response.headers.get('content-length'),
  );

  console.log(
    `[call-recorder] media-import phase=artifact-download-response callRecordingId=${callRecordingId} fileName=${fileName} responseStatus=${response.status} contentLengthBytes=${contentLengthBytes ?? 'unknown'} ${formatMemoryUsageForLog()}`,
  );

  if (!response.ok) {
    await cancelMediaDownloadBody({
      callRecordingId,
      fileName,
      body: response.body,
    });

    throw new Error(`download failed with status ${response.status}`);
  }

  if (isUndefined(contentLengthBytes)) {
    await cancelMediaDownloadBody({
      callRecordingId,
      fileName,
      body: response.body,
    });

    throw new Error('download response is missing content-length');
  }

  if (contentLengthBytes > maxMediaFileSizeBytes) {
    await cancelMediaDownloadBody({
      callRecordingId,
      fileName,
      body: response.body,
    });

    return { outcome: 'too-large', sizeBytes: contentLengthBytes };
  }

  if (isNull(response.body)) {
    throw new Error('download returned no body');
  }

  return {
    outcome: 'opened',
    body: response.body,
    sizeBytes: contentLengthBytes,
  };
};

const uploadMediaStreamToStorage = async ({
  callRecordingId,
  metadataClient,
  fileName,
  fieldMetadataUniversalIdentifier,
  body,
  sizeBytes,
}: {
  callRecordingId: string;
  metadataClient: InstanceType<typeof MetadataApiClient>;
  fileName: string;
  fieldMetadataUniversalIdentifier: string;
  body: ReadableStream<Uint8Array>;
  sizeBytes: number;
}): Promise<string> => {
  const uploadTarget = await createFileUploadTarget({
    metadataClient,
    fileName,
    sizeBytes,
    fieldMetadataUniversalIdentifier,
  }).catch(async (error) => {
    await cancelMediaDownloadBody({
      callRecordingId,
      fileName,
      body,
    });

    throw error;
  });

  console.log(
    `[call-recorder] media-import phase=artifact-upload-start callRecordingId=${callRecordingId} fileName=${fileName} declaredBytes=${sizeBytes} ${formatMemoryUsageForLog()}`,
  );

  await putMediaDownloadBodyToUploadTarget({
    fileName,
    mediaDownloadBody: body,
    sizeBytes,
    uploadTarget,
  });

  return completeFileUpload({ metadataClient, fileId: uploadTarget.fileId });
};

const cancelMediaDownloadBody = async ({
  callRecordingId,
  fileName,
  body,
}: {
  callRecordingId: string;
  fileName: string;
  body: ReadableStream<Uint8Array> | null;
}) => {
  if (isNull(body)) {
    return;
  }

  await body.cancel().catch((error) => {
    console.warn(
      `[call-recorder] media-import phase=download-body-cancel-failed callRecordingId=${callRecordingId} fileName=${fileName}: ${error instanceof Error ? error.message : String(error)}`,
    );
  });
};

const createFileUploadTarget = async ({
  metadataClient,
  fileName,
  sizeBytes,
  fieldMetadataUniversalIdentifier,
}: {
  metadataClient: InstanceType<typeof MetadataApiClient>;
  fileName: string;
  sizeBytes: number;
  fieldMetadataUniversalIdentifier: string;
}): Promise<MediaUploadTarget> => {
  const mutationResult = await metadataClient.mutation({
    createFileUpload: {
      __args: {
        filename: fileName,
        size: sizeBytes,
        fileFolder: MEDIA_FILE_FOLDER,
        fieldMetadataUniversalIdentifier,
      },
      fileId: true,
      uploadUrl: true,
      contentType: true,
    },
  });
  const uploadTarget = mutationResult.createFileUpload;

  if (isUndefined(uploadTarget)) {
    throw new Error(
      'createFileUpload mutation did not return an upload target',
    );
  }

  return uploadTarget;
};

const completeFileUpload = async ({
  metadataClient,
  fileId,
}: {
  metadataClient: InstanceType<typeof MetadataApiClient>;
  fileId: string;
}): Promise<string> => {
  const mutationResult = await metadataClient.mutation({
    completeFileUpload: {
      __args: { fileId },
      id: true,
    },
  });
  const uploadedFileId = mutationResult.completeFileUpload?.id;

  if (isUndefined(uploadedFileId)) {
    throw new Error('completeFileUpload mutation did not return a file id');
  }

  return uploadedFileId;
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
