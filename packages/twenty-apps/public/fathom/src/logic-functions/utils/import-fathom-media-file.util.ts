import { isNonEmptyString, isNull, isUndefined } from '@sniptt/guards';
import { type RecordingDownloadFile } from 'fathom-typescript/sdk/models/shared';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import {
  FATHOM_MEDIA_DOWNLOAD_TIMEOUT_MILLISECONDS,
  FATHOM_MEDIA_FILE_FOLDER,
  FATHOM_MEDIA_MAX_FILE_SIZE_BYTES,
} from 'src/constants/fathom.constant';
import {
  CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER,
  CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type CallRecordingMediaFile } from 'src/logic-functions/types/call-recording-media-file.type';
import { putFathomMediaBodyToUploadTarget } from 'src/logic-functions/utils/put-fathom-media-body-to-upload-target.util';

export type FathomMediaKind = 'video' | 'audio';

export type ImportFathomMediaFileResult =
  | { outcome: 'imported'; files: CallRecordingMediaFile[] }
  | { outcome: 'too-large'; sizeBytes: number };

type MediaUploadTarget = {
  fileId: string;
  uploadUrl: string;
  contentType: string;
};

type OpenMediaDownloadResult =
  | { outcome: 'opened'; body: ReadableStream<Uint8Array>; sizeBytes: number }
  | { outcome: 'too-large'; sizeBytes: number };

const MEDIA_DESCRIPTOR_BY_KIND = {
  video: {
    fileName: 'video.mp4',
    fieldMetadataUniversalIdentifier:
      CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER,
  },
  audio: {
    fileName: 'audio.mp3',
    fieldMetadataUniversalIdentifier:
      CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER,
  },
} as const satisfies Record<
  FathomMediaKind,
  { fileName: string; fieldMetadataUniversalIdentifier: string }
>;

// Throws on a failed download or upload so the caller can hand the job back to
// the platform for redelivery while the signed URL is still valid.
export const importFathomMediaFile = async ({
  callRecordingId,
  kind,
  downloadFile,
}: {
  callRecordingId: string;
  kind: FathomMediaKind;
  downloadFile: RecordingDownloadFile;
}): Promise<ImportFathomMediaFileResult> => {
  const { fileName, fieldMetadataUniversalIdentifier } =
    MEDIA_DESCRIPTOR_BY_KIND[kind];

  // Fathom declares the size before the transfer, so an oversized recording is
  // rejected without opening its body at all.
  if (downloadFile.fileSizeBytes > FATHOM_MEDIA_MAX_FILE_SIZE_BYTES) {
    console.warn(
      `[fathom] media-import phase=declared-size-too-large callRecordingId=${callRecordingId} fileName=${fileName} sizeBytes=${downloadFile.fileSizeBytes} maxMediaFileSizeBytes=${FATHOM_MEDIA_MAX_FILE_SIZE_BYTES}`,
    );

    return { outcome: 'too-large', sizeBytes: downloadFile.fileSizeBytes };
  }

  const download = await openMediaDownload({
    callRecordingId,
    fileName,
    url: downloadFile.url,
  });

  if (download.outcome === 'too-large') {
    console.warn(
      `[fathom] media-import phase=artifact-too-large callRecordingId=${callRecordingId} fileName=${fileName} sizeBytes=${download.sizeBytes} maxMediaFileSizeBytes=${FATHOM_MEDIA_MAX_FILE_SIZE_BYTES}`,
    );

    return { outcome: 'too-large', sizeBytes: download.sizeBytes };
  }

  const fileId = await uploadMediaStreamToStorage({
    callRecordingId,
    fileName,
    fieldMetadataUniversalIdentifier,
    body: download.body,
    sizeBytes: download.sizeBytes,
  });

  return { outcome: 'imported', files: [{ fileId, label: fileName }] };
};

const openMediaDownload = async ({
  callRecordingId,
  fileName,
  url,
}: {
  callRecordingId: string;
  fileName: string;
  url: string;
}): Promise<OpenMediaDownloadResult> => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FATHOM_MEDIA_DOWNLOAD_TIMEOUT_MILLISECONDS),
  });
  const contentLengthBytes = parseContentLengthBytes(
    response.headers.get('content-length'),
  );

  console.log(
    `[fathom] media-import phase=artifact-download-response callRecordingId=${callRecordingId} fileName=${fileName} responseStatus=${response.status} contentLengthBytes=${contentLengthBytes ?? 'unknown'} ${formatMemoryUsageForLog()}`,
  );

  if (!response.ok) {
    await cancelMediaDownloadBody({
      callRecordingId,
      fileName,
      body: response.body,
    });

    throw new Error(`download failed with status ${response.status}`);
  }

  // createFileUpload reserves an exact byte count and the PUT declares it, so a
  // stream of unknown length cannot be uploaded.
  if (isUndefined(contentLengthBytes)) {
    await cancelMediaDownloadBody({
      callRecordingId,
      fileName,
      body: response.body,
    });

    throw new Error('download response is missing content-length');
  }

  if (contentLengthBytes > FATHOM_MEDIA_MAX_FILE_SIZE_BYTES) {
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
  fileName,
  fieldMetadataUniversalIdentifier,
  body,
  sizeBytes,
}: {
  callRecordingId: string;
  fileName: string;
  fieldMetadataUniversalIdentifier: string;
  body: ReadableStream<Uint8Array>;
  sizeBytes: number;
}): Promise<string> => {
  const metadataClient = new MetadataApiClient();
  const uploadTarget = await createFileUploadTarget({
    metadataClient,
    fileName,
    sizeBytes,
    fieldMetadataUniversalIdentifier,
  }).catch(async (error: unknown) => {
    await cancelMediaDownloadBody({ callRecordingId, fileName, body });

    throw error;
  });

  console.log(
    `[fathom] media-import phase=artifact-upload-start callRecordingId=${callRecordingId} fileName=${fileName} declaredBytes=${sizeBytes} ${formatMemoryUsageForLog()}`,
  );

  await putFathomMediaBodyToUploadTarget({
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

  await body.cancel().catch((error: unknown) => {
    console.warn(
      `[fathom] media-import phase=download-body-cancel-failed callRecordingId=${callRecordingId} fileName=${fileName}: ${error instanceof Error ? error.message : String(error)}`,
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
        fileFolder: FATHOM_MEDIA_FILE_FOLDER,
        fieldMetadataUniversalIdentifier,
      },
      fileId: true,
      uploadUrl: true,
      contentType: true,
    },
  });
  const uploadTarget = mutationResult.createFileUpload;

  if (isUndefined(uploadTarget)) {
    throw new Error('createFileUpload mutation did not return an upload target');
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
