import { useRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';
import {
  useRemoveWorkspaceLogoMutation,
  useUploadWorkspaceLogoMutation,
} from '~/generated/graphql';

export const WorkspaceLogoUploader = () => {
  const [uploadLogo] = useUploadWorkspaceLogoMutation();
  const [removeLogo] = useRemoveWorkspaceLogoMutation();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const onUpload = async (file: File) => {
    if (!file) {
      return;
    }
    await uploadLogo({
      variables: {
        file,
      },
      onCompleted: (data) => {
        setCurrentWorkspace({
          ...currentWorkspace,
          logo: data.uploadWorkspaceLogo,
        } as any);
      },
    });
  };

  const onRemove = async () => {
    await removeLogo({
      onCompleted: () => {
        setCurrentWorkspace({
          ...currentWorkspace,
          logo: null,
        } as any);
      },
    });
  };

  return (
    <ImageInput
      picture={getImageAbsoluteURIOrBase64(currentWorkspace?.logo)}
      onUpload={onUpload}
      onRemove={onRemove}
    />
  );
};
