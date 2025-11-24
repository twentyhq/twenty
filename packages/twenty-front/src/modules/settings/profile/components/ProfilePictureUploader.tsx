import { useState } from 'react';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useCanEditProfileField } from '@/settings/profile/hooks/useCanEditProfileField';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { buildSignedPath, isDefined } from 'twenty-shared/utils';
import { useUploadProfilePictureMutation } from '~/generated-metadata/graphql';
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

  const { canEdit: canEditProfilePicture } =
    useCanEditProfileField('profilePicture');

  const handleUpload = async (file: File) => {
    if (isUndefinedOrNull(file) || !canEditProfilePicture) {
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

      const signedFile = result?.data?.uploadProfilePicture;

      if (!isDefined(signedFile)) {
        throw new Error('Avatar URL not found');
      }

      await updateOneRecord({
        idToUpdate: currentWorkspaceMember?.id,
        updateOneRecordInput: {
          avatarUrl: signedFile.path,
        },
      });

      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        avatarUrl: buildSignedPath(signedFile),
      });

      return result;
    } catch {
      setErrorMessage('An error occurred while uploading the picture.');
    }
  };

  const handleAbort = async () => {
    if (!canEditProfilePicture) {
      return;
    }

    if (isDefined(uploadController)) {
      uploadController.abort();
      setUploadController(null);
    }
  };

  const handleRemove = async () => {
    if (!canEditProfilePicture) {
      return;
    }

    try {
      if (!currentWorkspaceMember?.id) {
        throw new Error('User is not logged in');
      }

      await updateOneRecord({
        idToUpdate: currentWorkspaceMember?.id,
        updateOneRecordInput: {
          avatarUrl: '',
        },
      });

      setCurrentWorkspaceMember({ ...currentWorkspaceMember, avatarUrl: null });
    } catch {
      setErrorMessage('An error occurred while removing the picture.');
    }
  };

  return (
    <ImageInput
      picture={currentWorkspaceMember?.avatarUrl}
      onUpload={handleUpload}
      onRemove={handleRemove}
      onAbort={handleAbort}
      isUploading={isUploading}
      errorMessage={errorMessage}
      disabled={!canEditProfilePicture}
    />
  );
};
