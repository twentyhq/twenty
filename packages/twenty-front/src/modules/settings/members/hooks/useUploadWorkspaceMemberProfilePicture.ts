import { putFileToUploadTarget } from '@/file/utils/putFileToUploadTarget';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  CompleteWorkspaceMemberProfilePictureUploadDocument,
  CreateWorkspaceMemberProfilePictureUploadDocument,
  type FileWithSignedUrl,
} from '~/generated-metadata/graphql';

type UploadWorkspaceMemberProfilePictureOptions = {
  signal?: AbortSignal;
};

export const useUploadWorkspaceMemberProfilePicture = () => {
  const [createWorkspaceMemberProfilePictureUpload] = useMutation(
    CreateWorkspaceMemberProfilePictureUploadDocument,
  );
  const [completeWorkspaceMemberProfilePictureUpload] = useMutation(
    CompleteWorkspaceMemberProfilePictureUploadDocument,
  );

  const uploadWorkspaceMemberProfilePicture = async (
    file: File,
    { signal }: UploadWorkspaceMemberProfilePictureOptions = {},
  ): Promise<FileWithSignedUrl> => {
    const createResult = await createWorkspaceMemberProfilePictureUpload({
      variables: { filename: file.name, size: file.size },
    });

    const uploadTarget =
      createResult?.data?.createWorkspaceMemberProfilePictureUpload;

    if (!isDefined(uploadTarget)) {
      throw new Error('Failed to initiate picture upload');
    }

    await putFileToUploadTarget({ file, uploadTarget, signal });

    const completeResult = await completeWorkspaceMemberProfilePictureUpload({
      variables: { fileId: uploadTarget.fileId },
    });

    const uploadedPicture =
      completeResult?.data?.completeWorkspaceMemberProfilePictureUpload;

    if (!isDefined(uploadedPicture)) {
      throw new Error('Failed to finalize picture upload');
    }

    return uploadedPicture;
  };

  return { uploadWorkspaceMemberProfilePicture };
};
