import { useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
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
      objectNameSingular: 'workspaceMemberV2',
    });

  const handleUpload = async (file: File) => {
    if (!file) {
      return;
    }

    const controller = new AbortController();
    setUploadController(controller);

    try {
      const result = await uploadPicture({
        variables: {
          file,
        },
        context: {
          fetchOptions: {
            signal: controller.signal,
          },
        },
        refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
      });

      setUploadController(null);
      setErrorMessage(null);

      const avatarUrl = result?.data?.uploadProfilePicture;

      if (!avatarUrl) {
        return;
      }
      if (!updateOneObject || objectNotFoundInMetadata) {
        return;
      }
      await updateOneObject({
        idToUpdate: currentWorkspaceMember?.id ?? '',
        input: {
          avatarUrl,
        },
      });

      setCurrentWorkspaceMember(
        (current) => ({ ...current, avatarUrl } as any),
      );

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
      return;
    }
    await updateOneObject({
      idToUpdate: currentWorkspaceMember?.id ?? '',
      input: {
        avatarUrl: null,
      },
    });

    setCurrentWorkspaceMember(
      (current) => ({ ...current, avatarUrl: null } as any),
    );
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
