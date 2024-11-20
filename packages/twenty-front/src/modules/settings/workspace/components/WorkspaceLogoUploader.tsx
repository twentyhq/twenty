import { useRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ImageInput } from '@/ui/input/components/ImageInput';
import {
  useUpdateWorkspaceMutation,
  useUploadWorkspaceLogoMutation,
} from '~/generated/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const WorkspaceLogoUploader = () => {
  const [uploadLogo] = useUploadWorkspaceLogoMutation();
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const onUpload = async (file: File) => {
    if (isUndefinedOrNull(file)) {
      return;
    }
    if (!currentWorkspace?.id) {
      throw new Error('Workspace id not found');
    }
    await uploadLogo({
      variables: {
        file,
      },
      onCompleted: (data) => {
        setCurrentWorkspace({
          ...currentWorkspace,
          logo: data.uploadWorkspaceLogo,
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
