import { putFileToUploadTarget } from '@/file/utils/putFileToUploadTarget';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
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

  const createFileUploadAndPutFile = async (
    file: File,
    { fileFolder, fieldMetadataId, signal }: DirectFileUploadOptions,
  ): Promise<{ fileId: string }> => {
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
      throw new Error(t`Failed to initiate file upload`);
    }

    await putFileToUploadTarget({ file, uploadTarget, signal });

    return { fileId: uploadTarget.fileId };
  };

  const uploadFile = async (
    file: File,
    options: DirectFileUploadOptions,
  ): Promise<FileWithSignedUrl> => {
    const { fileId } = await createFileUploadAndPutFile(file, options);

    const completeResult = await completeFileUpload({
      variables: { fileId },
    });

    const uploadedFile = completeResult?.data?.completeFileUpload;

    if (!isDefined(uploadedFile)) {
      throw new Error(t`Failed to finalize file upload`);
    }

    return uploadedFile;
  };

  return { uploadFile, createFileUploadAndPutFile };
};
