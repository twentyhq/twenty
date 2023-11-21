import { useState } from 'react';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';
import { useUploadProfilePictureMutation } from '~/generated/graphql';

export const ProfilePictureUploader = () => {
  const [uploadPicture, { loading: isUploading }] =
    useUploadProfilePictureMutation();

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const [uploadController, setUploadController] =
    useState<AbortController | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { updateOneObject, objectNotFoundInMetadata } =
    useUpdateOneObjectRecord({
      objectNameSingular: 'workspaceMember',
    });

  const handleUpload = async (file: File) => {
    if (!file) {
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
      if (!updateOneObject || objectNotFoundInMetadata) {
        throw new Error('Object not found in metadata');
      }
      await updateOneObject({
        idToUpdate: currentWorkspaceMember?.id,
        input: {
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
    if (uploadController) {
      uploadController.abort();
      setUploadController(null);
    }
  };

  const handleRemove = async () => {
    if (!updateOneObject || objectNotFoundInMetadata) {
      throw new Error('Object not found in metadata');
    }
    if (!currentWorkspaceMember?.id) {
      throw new Error('User is not logged in');
    }
    await updateOneObject({
      idToUpdate: currentWorkspaceMember?.id,
      input: {
        avatarUrl: null,
      },
    });

    setCurrentWorkspaceMember({ ...currentWorkspaceMember, avatarUrl: null });
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
