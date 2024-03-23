import { useState } from 'react';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';
import { useUploadProfilePictureMutation } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const ProfilePictureUploader = () => {
  const [uploadPicture, { loading: isUploading }] =
    useUploadProfilePictureMutation();

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const [uploadController, setUploadController] =
    useState<AbortController | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const handleUpload = async (file: File) => {
    if (isUndefinedOrNull(file)) {
      return;
    }

    const controller = new AbortController();
    setUploadController(controller);

    try {
      if (!currentWorkspaceMember?.id) {
        throw new Error('User is not logged in');
      }
      const result = await uploadPicture({
        variables: {
          file,
        },
        context: {
          fetchOptions: {
            signal: controller.signal,
          },
        },
      });

      setUploadController(null);
      setErrorMessage(null);

      const avatarUrl = result?.data?.uploadProfilePicture;

      if (!avatarUrl) {
        throw new Error('Avatar URL not found');
      }

      await updateOneRecord({
        idToUpdate: currentWorkspaceMember?.id,
        updateOneRecordInput: {
          avatarUrl,
        },
      });

      setCurrentWorkspaceMember({ ...currentWorkspaceMember, avatarUrl });

      return result;
    } catch (error) {
      setErrorMessage('An error occured while uploading the picture.');
    }
  };

  const handleAbort = async () => {
    if (isDefined(uploadController)) {
      uploadController.abort();
      setUploadController(null);
    }
  };

  const handleRemove = async () => {
    try {
      if (!currentWorkspaceMember?.id) {
        throw new Error('User is not logged in');
      }

      await updateOneRecord({
        idToUpdate: currentWorkspaceMember?.id,
        updateOneRecordInput: {
          avatarUrl: null,
        },
      });

      setCurrentWorkspaceMember({ ...currentWorkspaceMember, avatarUrl: null });
    } catch (error) {
      setErrorMessage('An error occured while removing the picture.');
    }
  };

  return (
    <ImageInput
      picture={getImageAbsoluteURIOrBase64(currentWorkspaceMember?.avatarUrl)}
      onUpload={handleUpload}
      onRemove={handleRemove}
      onAbort={handleAbort}
      isUploading={isUploading}
      errorMessage={errorMessage}
    />
  );
};
