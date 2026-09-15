import { useApolloClient, useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  CompleteFileUploadDocument,
  CreateFileUploadDocument,
  type FileFolder,
  type FileWithSignedUrl,
} from '~/generated-metadata/graphql';

type DirectFileUploadOptions = {
  fileFolder: FileFolder;
  fieldMetadataId?: string;
  signal?: AbortSignal;
};

export const useDirectFileUpload = () => {
  const apolloClient = useApolloClient();
  const [createFileUpload] = useMutation(CreateFileUploadDocument, {
    client: apolloClient,
  });
  const [completeFileUpload] = useMutation(CompleteFileUploadDocument, {
    client: apolloClient,
  });

  const uploadFile = async (
    file: File,
    { fileFolder, fieldMetadataId, signal }: DirectFileUploadOptions,
  ): Promise<FileWithSignedUrl> => {
    const createResult = await createFileUpload({
      variables: {
        filename: file.name,
        size: file.size,
        fileFolder,
        fieldMetadataId,
      },
    });

    const uploadTarget = createResult?.data?.createFileUpload;

    if (!isDefined(uploadTarget)) {
      throw new Error('Failed to initiate file upload');
    }

    const putResponse = await fetch(uploadTarget.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': uploadTarget.contentType },
      body: file,
      credentials: 'omit',
      signal,
    });

    if (!putResponse.ok) {
      throw new Error(`File upload failed with status ${putResponse.status}`);
    }

    const completeResult = await completeFileUpload({
      variables: { fileId: uploadTarget.fileId },
    });

    const uploadedFile = completeResult?.data?.completeFileUpload;

    if (!isDefined(uploadedFile)) {
      throw new Error('Failed to finalize file upload');
    }

    return uploadedFile;
  };

  return { uploadFile };
};
