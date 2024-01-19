import { useRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import useI18n from '@/ui/i18n/useI18n';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';
import {
  useUpdateWorkspaceMutation,
  useUploadWorkspaceLogoMutation,
} from '~/generated/graphql';

export const WorkspaceLogoUploader = () => {
  const { translate } = useI18n('translations');
  const [uploadLogo] = useUploadWorkspaceLogoMutation();
  const [updateWorkspce] = useUpdateWorkspaceMutation();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const onUpload = async (file: File) => {
    if (!file) {
      return;
    }
    if (!currentWorkspace?.id) {
      throw new Error(translate('workspaceIdNotFound'));
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
      throw new Error(translate('workspaceIdNotFound'));
    }
    await updateWorkspce({
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
      picture={getImageAbsoluteURIOrBase64(currentWorkspace?.logo)}
      onUpload={onUpload}
      onRemove={onRemove}
    />
  );
};
