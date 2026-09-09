import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { useMutation } from '@apollo/client/react';
import {
  FileFolder,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const WorkspaceLogoUploader = () => {
  const { uploadFile } = useDirectFileUpload();
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

    const uploadedFile = await uploadFile(file, {
      fileFolder: FileFolder.CorePicture,
    });

    await updateWorkspace({
      variables: {
        input: {
          logoFileId: uploadedFile.id,
        },
      },
      onCompleted: (data) => {
        setCurrentWorkspace({
          ...currentWorkspace,
          logo: data.updateWorkspace.logo,
        });
      },
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
