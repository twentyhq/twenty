import { putFileToUploadTarget } from '@/file/utils/putFileToUploadTarget';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  CompleteWorkspaceLogoUploadDocument,
  CreateWorkspaceLogoUploadDocument,
  type FileWithSignedUrl,
} from '~/generated-metadata/graphql';

export const useUploadWorkspaceLogo = () => {
  const [createWorkspaceLogoUpload] = useMutation(
    CreateWorkspaceLogoUploadDocument,
  );
  const [completeWorkspaceLogoUpload] = useMutation(
    CompleteWorkspaceLogoUploadDocument,
  );

  const uploadWorkspaceLogo = async (
    file: File,
  ): Promise<FileWithSignedUrl> => {
    const createResult = await createWorkspaceLogoUpload({
      variables: { filename: file.name, size: file.size },
    });

    const uploadTarget = createResult?.data?.createWorkspaceLogoUpload;

    if (!isDefined(uploadTarget)) {
      throw new Error('Failed to initiate logo upload');
    }

    await putFileToUploadTarget({ file, uploadTarget });

    const completeResult = await completeWorkspaceLogoUpload({
      variables: { fileId: uploadTarget.fileId },
    });

    const uploadedLogo = completeResult?.data?.completeWorkspaceLogoUpload;

    if (!isDefined(uploadedLogo)) {
      throw new Error('Failed to finalize logo upload');
    }

    return uploadedLogo;
  };

  return { uploadWorkspaceLogo };
};
