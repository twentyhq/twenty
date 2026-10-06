import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { SettingsImageInput } from '@/settings/components/SettingsImageInput';
import { useUploadWorkspaceLogo } from '@/workspace/hooks/useUploadWorkspaceLogo';
import { useMutation } from '@apollo/client/react';
import { useToast } from 'twenty-ui/components/feedback';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const WorkspaceLogoUploader = () => {
  const { enqueueToast } = useToast();
  const { uploadWorkspaceLogo } = useUploadWorkspaceLogo();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onUpload = async (file: File) => {
    if (isUndefinedOrNull(file)) {
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      if (!currentWorkspace?.id) {
        throw new Error(t`Failed to upload picture`);
      }

      const uploadedLogo = await uploadWorkspaceLogo(file);

      setCurrentWorkspace({
        ...currentWorkspace,
        logo: uploadedLogo.url,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t`Failed to upload picture`;
      setErrorMessage(t`An error occurred while uploading the picture.`);
      enqueueToast({ variant: 'error', children: message });
    } finally {
      setIsUploading(false);
    }
  };

  const onRemove = async () => {
    setIsRemoving(true);
    setErrorMessage(null);

    try {
      if (!currentWorkspace?.id) {
        throw new Error(t`Failed to remove picture`);
      }

      await updateWorkspace({
        variables: {
          input: {
            logo: null,
          },
        },
        onCompleted: () => {
          setCurrentWorkspace({
            ...currentWorkspace,
            logo: null,
          });
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t`Failed to remove picture`;
      setErrorMessage(t`An error occurred while removing the picture.`);
      enqueueToast({ variant: 'error', children: message });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <SettingsImageInput
      picture={currentWorkspace?.logo}
      onUpload={onUpload}
      onRemove={onRemove}
      isUploading={isUploading || isRemoving}
      errorMessage={errorMessage}
    />
  );
};
