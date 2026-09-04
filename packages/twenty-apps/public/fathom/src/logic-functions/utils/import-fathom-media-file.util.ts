import { type RecordingDownloadFile } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { FATHOM_MEDIA_MAX_FILE_SIZE_BYTES } from 'src/constants/fathom.constant';
import {
  CALL_RECORDING_AUDIO_FIELD_UNIVERSAL_IDENTIFIER,
  CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type FathomMediaKind } from 'src/logic-functions/schemas/fathom-media-kind.schema';
import { type CallRecordingMediaFile } from 'src/logic-functions/types/call-recording-media-file.type';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';
import { completeFathomMediaFileUpload } from 'src/logic-functions/utils/complete-fathom-media-file-upload.util';
import { openFathomMediaDownload } from 'src/logic-functions/utils/open-fathom-media-download.util';
import { uploadFathomMediaStream } from 'src/logic-functions/utils/upload-fathom-media-stream.util';
import { updateFathomMediaUploadCheckpoint } from 'src/logic-functions/utils/update-fathom-media-upload-checkpoint.util';

export type { FathomMediaKind } from 'src/logic-functions/schemas/fathom-media-kind.schema';

export type ImportFathomMediaFileResult =
  | { outcome: 'imported'; files: CallRecordingMediaFile[] }
  | { outcome: 'empty' }
  | { outcome: 'stale' }
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
} satisfies Record<
  FathomMediaKind,
  { fileName: string; fieldMetadataUniversalIdentifier: string }
>;

export const importFathomMediaFile = async ({
  callRecordingId,
  coreApiClient,
  downloadId,
  writeContext,
  kind,
  downloadFile,
}: {
  callRecordingId: string;
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  downloadId: string;
  writeContext: FathomMediaWriteContext;
  kind: FathomMediaKind;
  downloadFile: Pick<RecordingDownloadFile, 'fileSizeBytes' | 'url'>;
}): Promise<ImportFathomMediaFileResult> => {
  const { fileName, fieldMetadataUniversalIdentifier } =
    MEDIA_DESCRIPTOR_BY_KIND[kind];

  if (
    !Number.isSafeInteger(downloadFile.fileSizeBytes) ||
    downloadFile.fileSizeBytes <= 0
  ) {
    return { outcome: 'empty' };
  }

  if (downloadFile.fileSizeBytes > FATHOM_MEDIA_MAX_FILE_SIZE_BYTES) {
    return { outcome: 'too-large', sizeBytes: downloadFile.fileSizeBytes };
  }

  const download = await openFathomMediaDownload({
    callRecordingId,
    fileName,
    downloadFile,
  });

  if (download.outcome !== 'opened') {
    return download;
  }

  const fileId = await uploadFathomMediaStream({
    callRecordingId,
    fileName,
    fieldMetadataUniversalIdentifier,
    body: download.body,
    sizeBytes: download.sizeBytes,
  });

  const wasCheckpointSaved = await updateFathomMediaUploadCheckpoint({
    coreApiClient,
    callRecordingId,
    writeContext,
    uploadCheckpoint: { downloadId, fileId, kind },
  });

  if (!wasCheckpointSaved) {
    return { outcome: 'stale' };
  }

  await completeFathomMediaFileUpload({ fileId });

  return { outcome: 'imported', files: [{ fileId, label: fileName }] };
};
