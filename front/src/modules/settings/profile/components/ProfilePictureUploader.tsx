import { useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { ImageInput } from '@/ui/input/image/components/ImageInput';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';
import {
  useRemoveProfilePictureMutation,
  useUploadProfilePictureMutation,
} from '~/generated/graphql';

export function ProfilePictureUploader() {
  const [uploadPicture] = useUploadProfilePictureMutation();
  const [removePicture] = useRemoveProfilePictureMutation();
  const [currentUser] = useRecoilState(currentUserState);
  const [uploadController, setUploadController] =
    useState<AbortController | null>(null);
  const [error, setError] = useState<Error | null>(null);

  async function handleUpload(file: File) {
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
      setError(null);
      return result;
    } catch (error) {
      setError(error as Error);
    }
  }

  async function handleAbort() {
    if (uploadController) {
      uploadController.abort();
      setUploadController(null);
    }
  }

  async function handleRemove() {
    await removePicture({
      variables: {
        where: {
          id: currentUser?.id,
        },
      },
      refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
    });
  }

  return (
    <ImageInput
      picture={getImageAbsoluteURIOrBase64(currentUser?.avatarUrl)}
      onUpload={handleUpload}
      onRemove={handleRemove}
      onAbort={handleAbort}
      error={error}
    />
  );
}
