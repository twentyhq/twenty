import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  CompleteWorkspaceLogoUploadDocument,
  FileFolder,
  type FileWithSignedUrl,
} from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

export const useUploadWorkspaceLogo = () => {
  const { t } = useLingui();
  const { createFileUploadAndPutFile } = useDirectFileUpload();
  const [completeWorkspaceLogoUpload] = useMutation(
    CompleteWorkspaceLogoUploadDocument,
  );

  const uploadWorkspaceLogo = async (
    file: File,
  ): Promise<FileWithSignedUrl> => {
    const { fileId } = await createFileUploadAndPutFile(file, {
      fileFolder: FileFolder.CorePicture,
    });

    const completeResult = await completeWorkspaceLogoUpload({
      variables: { fileId },
    });

    const uploadedLogo = completeResult?.data?.completeWorkspaceLogoUpload;

    if (!isDefined(uploadedLogo)) {
      throw new Error(t`Failed to finalize logo upload`);
    }

    return uploadedLogo;
  };

  return { uploadWorkspaceLogo };
};
