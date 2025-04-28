import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useUploadProfilePictureMutation } from '~/generated/graphql';
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
  const [validPictureURL, setValidPictureURL] = useState<string | null>(null);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  useEffect(() => {
    const checkImageValidity = async () => {
      const pictureURL = getImageAbsoluteURI({
        imageUrl: currentWorkspaceMember?.avatarUrl || '',
        baseUrl: REACT_APP_SERVER_BASE_URL,
      });

      const response = await fetch(pictureURL || '', {
        method: 'HEAD',
      });
      if (response.ok) {
        setValidPictureURL(pictureURL);
      }
    };

    checkImageValidity();
  }, [currentWorkspaceMember?.avatarUrl]);

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

      const avatarUrl = result?.data?.uploadProfilePicture.split('?')[0];

      if (!avatarUrl) {
        throw new Error('Avatar URL not found');
      }

      await updateOneRecord({
        idToUpdate: currentWorkspaceMember?.id,
        updateOneRecordInput: {
          avatarUrl,
        },
      });

      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        avatarUrl: result?.data?.uploadProfilePicture,
      });

      return result;
    } catch (error) {
      setErrorMessage('An error occurred while uploading the picture.');
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
          avatarUrl: '',
        },
      });

      setCurrentWorkspaceMember({ ...currentWorkspaceMember, avatarUrl: null });
      setValidPictureURL(null);
    } catch (error) {
      setErrorMessage('An error occurred while removing the picture.');
    }
  };

  return (
    <ImageInput
      picture={validPictureURL}
      onUpload={handleUpload}
      onRemove={handleRemove}
      onAbort={handleAbort}
      isUploading={isUploading}
      errorMessage={errorMessage}
    />
  );
};
