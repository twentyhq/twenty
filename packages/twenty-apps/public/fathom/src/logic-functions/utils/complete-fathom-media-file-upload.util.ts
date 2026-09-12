import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

export const completeFathomMediaFileUpload = async ({
  fileId,
}: {
  fileId: string;
}): Promise<string> => {
  const metadataClient = new MetadataApiClient();
  const mutationResult = await metadataClient.mutation({
    completeFileUpload: {
      __args: { fileId },
      id: true,
    },
  });
  const uploadedFileId = mutationResult.completeFileUpload?.id;

  if (!isNonEmptyString(uploadedFileId)) {
    throw new Error('completeFileUpload mutation did not return a file id');
  }

  return uploadedFileId;
};
