import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { FATHOM_MEDIA_FILE_FOLDER } from 'src/constants/fathom.constant';
import { cancelFathomMediaDownloadBody } from 'src/logic-functions/utils/cancel-fathom-media-download-body.util';
import { putFathomMediaBodyToUploadTarget } from 'src/logic-functions/utils/put-fathom-media-body-to-upload-target.util';

export const uploadFathomMediaStream = async ({
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
  const uploadTarget = await metadataClient
    .mutation({
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
    })
    .then((mutationResult) => {
      const uploadTarget = mutationResult.createFileUpload;

      if (
        isUndefined(uploadTarget) ||
        !isNonEmptyString(uploadTarget.fileId) ||
        !isNonEmptyString(uploadTarget.uploadUrl) ||
        !isNonEmptyString(uploadTarget.contentType)
      ) {
        throw new Error('createFileUpload mutation returned an invalid target');
      }

      return uploadTarget;
    })
    .catch(async (error: unknown) => {
      await cancelFathomMediaDownloadBody({
        callRecordingId,
        fileName,
        body,
      });

      throw error;
    });

  await putFathomMediaBodyToUploadTarget({
    callRecordingId,
    fileName,
    mediaDownloadBody: body,
    sizeBytes,
    uploadTarget,
  });

  return uploadTarget.fileId;
};
