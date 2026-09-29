import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { useUploadWorkspaceLogo } from '@/workspace/hooks/useUploadWorkspaceLogo';
import { useMutation } from '@apollo/client/react';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const WorkspaceLogoUploader = () => {
  const { uploadWorkspaceLogo } = useUploadWorkspaceLogo();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const onUpload = async (file: File) => {
    if (isUndefinedOrNull(file)) {
      return;
    }
    if (!currentWorkspace?.id) {
      throw new Error('Workspace id not found');
    }

    const uploadedLogo = await uploadWorkspaceLogo(file);

    setCurrentWorkspace({
      ...currentWorkspace,
      logo: uploadedLogo.url,
    });
  };

  const onRemove = async () => {
    if (!currentWorkspace?.id) {
      throw new Error('Workspace id not found');
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
  };

  return (
    <ImageInput
      picture={currentWorkspace?.logo}
      onUpload={onUpload}
      onRemove={onRemove}
    />
  );
};
