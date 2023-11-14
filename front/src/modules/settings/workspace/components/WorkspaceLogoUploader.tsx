import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';
import {
  useRemoveWorkspaceLogoMutation,
  useUploadWorkspaceLogoMutation,
} from '~/generated/graphql';

export const WorkspaceLogoUploader = () => {
  const [uploadLogo] = useUploadWorkspaceLogoMutation();
  const [removeLogo] = useRemoveWorkspaceLogoMutation();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const onUpload = async (file: File) => {
    if (!file) {
      return;
    }
    await uploadLogo({
      variables: {
        file,
      },
      refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
    });
  };

  const onRemove = async () => {
    await removeLogo({
      refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
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
