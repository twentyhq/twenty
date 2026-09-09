import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCanEditProfileField } from '@/settings/profile/hooks/useCanEditProfileField';
import { useUpdateWorkspaceMemberSettings } from '@/settings/profile/hooks/useUpdateWorkspaceMemberSettings';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { UploadWorkspaceMemberProfilePictureDocument } from '~/generated-metadata/graphql';
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

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const setCurrentWorkspaceMember = useSetAtomState(
    currentWorkspaceMemberState,
  );

  const [uploadPicture] = useMutation(
    UploadWorkspaceMemberProfilePictureDocument,
  );

  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();

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

    let newAvatarUrl: string | null = null;
    try {
      const { data } = await uploadPicture({
        variables: { file },
        context: {
          fetchOptions: {
            signal: controller.signal,
          },
        },
      });

      const uploadedFile = data?.uploadWorkspaceMemberProfilePicture;
      if (!isDefined(uploadedFile)) {
        throw new Error('Avatar upload failed');
      }

      newAvatarUrl = `${REACT_APP_SERVER_BASE_URL}/file/${FileFolder.CorePicture}/${uploadedFile.id}`;
      await updateWorkspaceMemberSettings({
        workspaceMemberId,
        update: { avatarUrl: newAvatarUrl },
      });

      const signedUrl = uploadedFile.url;

      if (isDefined(signedUrl) && isEditingSelf) {
        setCurrentWorkspaceMember((previous) =>
          previous ? { ...previous, avatarUrl: signedUrl } : previous,
        );
      }

      if (isDefined(onAvatarUpdated)) {
        onAvatarUpdated(signedUrl ?? newAvatarUrl);
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
      await updateWorkspaceMemberSettings({
        workspaceMemberId,
        update: { avatarUrl: null },
      });

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
