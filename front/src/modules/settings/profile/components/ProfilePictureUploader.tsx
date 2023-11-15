import { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';
import {
  useRemoveProfilePictureMutation,
  useUploadProfilePictureMutation,
} from '~/generated/graphql';

export const ProfilePictureUploader = () => {
  const [uploadPicture, { loading: isUploading }] =
    useUploadProfilePictureMutation();
  const [removePicture] = useRemoveProfilePictureMutation();
  const [currentUser] = useRecoilState(currentUserState);
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const [uploadController, setUploadController] =
    useState<AbortController | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apolloClient = useApolloClient();
  const { updateOneMutation } = useFindOneObjectMetadataItem({
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
      await apolloClient.mutate({
        mutation: updateOneMutation,
        variables: {
          idToUpdate: currentWorkspaceMember?.id,
          input: {
            avatarUrl: avatarUrl,
          },
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
    await removePicture({
      variables: {
        where: {
          id: currentUser?.id,
        },
      },
      refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
    });
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
