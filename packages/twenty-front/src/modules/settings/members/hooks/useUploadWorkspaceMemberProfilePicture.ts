import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  CompleteWorkspaceMemberProfilePictureUploadDocument,
  FileFolder,
  type FileWithSignedUrl,
} from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

type UploadWorkspaceMemberProfilePictureOptions = {
  signal?: AbortSignal;
};

export const useUploadWorkspaceMemberProfilePicture = () => {
  const { t } = useLingui();
  const { createFileUploadAndPutFile } = useDirectFileUpload();
  const [completeWorkspaceMemberProfilePictureUpload] = useMutation(
    CompleteWorkspaceMemberProfilePictureUploadDocument,
  );

  const uploadWorkspaceMemberProfilePicture = async (
    file: File,
    { signal }: UploadWorkspaceMemberProfilePictureOptions = {},
  ): Promise<FileWithSignedUrl> => {
    const { fileId } = await createFileUploadAndPutFile(file, {
      fileFolder: FileFolder.CorePicture,
      signal,
    });

    const completeResult = await completeWorkspaceMemberProfilePictureUpload({
      variables: { fileId },
      context: { fetchOptions: { signal } },
    });

    const uploadedPicture =
      completeResult?.data?.completeWorkspaceMemberProfilePictureUpload;

    if (!isDefined(uploadedPicture)) {
      throw new Error(t`Failed to finalize file upload`);
    }

    return uploadedPicture;
  };

  return { uploadWorkspaceMemberProfilePicture };
};
