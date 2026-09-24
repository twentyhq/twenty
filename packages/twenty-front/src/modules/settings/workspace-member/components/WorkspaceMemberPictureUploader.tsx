import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUploadWorkspaceMemberProfilePicture } from '@/settings/members/hooks/useUploadWorkspaceMemberProfilePicture';
import { useCanEditProfileField } from '@/settings/profile/hooks/useCanEditProfileField';
import { useUpdateWorkspaceMemberSettings } from '@/settings/profile/hooks/useUpdateWorkspaceMemberSettings';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
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
  const { enqueueToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadController, setUploadController] =
    useState<AbortController | null>(null);

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const setCurrentWorkspaceMember = useSetAtomState(
    currentWorkspaceMemberState,
  );

  const { uploadWorkspaceMemberProfilePicture } =
    useUploadWorkspaceMemberProfilePicture();

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
      const uploadedFile = await uploadWorkspaceMemberProfilePicture(file, {
        signal: controller.signal,
      });

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
      enqueueToast({ variant: 'error', children: message });
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
      enqueueToast({ variant: 'error', children: message });
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
