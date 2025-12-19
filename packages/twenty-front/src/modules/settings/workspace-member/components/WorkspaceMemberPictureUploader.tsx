import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { UPLOAD_WORKSPACE_MEMBER_PROFILE_PICTURE } from '@/settings/members/graphql/mutations/uploadWorkspaceMemberProfilePicture';
import { useCanEditProfileField } from '@/settings/profile/hooks/useCanEditProfileField';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { useMutation } from '@apollo/client';
import { buildSignedPath, isDefined } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type WorkspaceMemberPictureUploaderProps = {
  workspaceMemberId: string;
  avatarUrl?: string | null;
  onAvatarUpdated?: (url: string | null) => void;
  disabled?: boolean;
};

export const WorkspaceMemberPictureUploader = ({
  workspaceMemberId,
  avatarUrl,
  onAvatarUpdated,
  disabled = false,
}: WorkspaceMemberPictureUploaderProps) => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadController, setUploadController] =
    useState<AbortController | null>(null);

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const [uploadPicture] = useMutation(UPLOAD_WORKSPACE_MEMBER_PROFILE_PICTURE);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { canEdit: canEditProfilePicture } =
    useCanEditProfileField('profilePicture');

  const isEditingSelf = currentWorkspaceMember?.id === workspaceMemberId;
  const canEdit = isEditingSelf ? canEditProfilePicture : !disabled;

  const handleUpload = async (file: File) => {
    if (isUndefinedOrNull(file) || !canEdit) {
      return;
    }

    const controller = new AbortController();
    setUploadController(controller);
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const { data } = await uploadPicture({
        variables: { file },
        context: {
          fetchOptions: {
            signal: controller.signal,
          },
        },
      });

      const signedFile = data?.uploadWorkspaceMemberProfilePicture;
      if (!isDefined(signedFile)) {
        throw new Error('Avatar upload failed');
      }

      await updateOneRecord({
        idToUpdate: workspaceMemberId,
        updateOneRecordInput: { avatarUrl: signedFile.path },
      });

      const newAvatarUrl = buildSignedPath(signedFile);

      if (isEditingSelf && isDefined(currentWorkspaceMember)) {
        setCurrentWorkspaceMember({
          ...currentWorkspaceMember,
          avatarUrl: newAvatarUrl,
        });
      }

      if (isDefined(onAvatarUpdated)) {
        onAvatarUpdated(newAvatarUrl);
      }

      setUploadController(null);
      setErrorMessage(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t`Failed to upload picture`;
      setErrorMessage(t`An error occurred while uploading the picture.`);
      enqueueErrorSnackBar({ message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!canEdit) {
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      await updateOneRecord({
        idToUpdate: workspaceMemberId,
        updateOneRecordInput: { avatarUrl: '' },
      });

      if (isEditingSelf && isDefined(currentWorkspaceMember)) {
        setCurrentWorkspaceMember({
          ...currentWorkspaceMember,
          avatarUrl: null,
        });
      }

      if (isDefined(onAvatarUpdated)) {
        onAvatarUpdated(null);
      }

      setErrorMessage(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t`Failed to remove picture`;
      setErrorMessage(t`An error occurred while removing the picture.`);
      enqueueErrorSnackBar({ message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAbort = () => {
    if (!canEdit) {
      return;
    }

    if (isDefined(uploadController)) {
      uploadController.abort();
      setUploadController(null);
    }
    setIsUploading(false);
  };

  const displayAvatarUrl =
    avatarUrl ?? (isEditingSelf ? currentWorkspaceMember?.avatarUrl : null);

  return (
    <ImageInput
      picture={displayAvatarUrl}
      onUpload={handleUpload}
      onRemove={handleRemove}
      onAbort={handleAbort}
      isUploading={isUploading}
      errorMessage={errorMessage}
      disabled={!canEdit}
    />
  );
};
