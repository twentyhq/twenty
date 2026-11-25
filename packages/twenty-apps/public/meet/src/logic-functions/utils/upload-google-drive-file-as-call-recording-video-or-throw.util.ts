import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import { CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  MEET_RECORDING_FILE_FOLDER,
  MEET_RECORDING_FILE_NAME,
  MEET_RECORDING_TRANSFER_TIMEOUT_MILLISECONDS,
} from 'src/logic-functions/constants/meet-recording-import.constant';
import { MeetException } from 'src/logic-functions/types/meet-exception.type';
import { openGoogleDriveFileDownloadOrThrow } from 'src/logic-functions/utils/open-google-drive-file-download-or-throw.util';
import { putStreamToUploadUrlOrThrow } from 'src/logic-functions/utils/put-stream-to-upload-url-or-throw.util';

export const uploadGoogleDriveFileAsCallRecordingVideoOrThrow = async ({
  accessToken,
  driveFileId,
  sizeBytes,
}: {
  accessToken: string;
  driveFileId: string;
  sizeBytes: number;
}): Promise<string> => {
  const metadataApiClient = new MetadataApiClient({ runAs: 'application' });
  const { createFileUpload: uploadTarget } = await metadataApiClient.mutation({
    createFileUpload: {
      __args: {
        filename: MEET_RECORDING_FILE_NAME,
        size: sizeBytes,
        fileFolder: MEET_RECORDING_FILE_FOLDER,
        fieldMetadataUniversalIdentifier:
          CALL_RECORDING_VIDEO_FIELD_UNIVERSAL_IDENTIFIER,
      },
      fileId: true,
      uploadUrl: true,
      contentType: true,
    },
  });

  if (
    !isDefined(uploadTarget) ||
    !isNonEmptyString(uploadTarget.fileId) ||
    !isNonEmptyString(uploadTarget.uploadUrl) ||
    !isNonEmptyString(uploadTarget.contentType)
  ) {
    throw new MeetException({
      message: 'createFileUpload returned no upload target',
      code: 'FILE_UPLOAD_FAILED',
    });
  }

  const signal = AbortSignal.timeout(
    MEET_RECORDING_TRANSFER_TIMEOUT_MILLISECONDS,
  );

  await putStreamToUploadUrlOrThrow({
    stream: await openGoogleDriveFileDownloadOrThrow({
      accessToken,
      driveFileId,
      signal,
    }),
    sizeBytes,
    uploadUrl: uploadTarget.uploadUrl,
    contentType: uploadTarget.contentType,
    signal,
  });

  await metadataApiClient.mutation({
    completeFileUpload: { __args: { fileId: uploadTarget.fileId }, id: true },
  });

  return uploadTarget.fileId;
};
