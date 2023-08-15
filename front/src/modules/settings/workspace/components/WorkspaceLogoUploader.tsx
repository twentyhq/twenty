import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { ImageInput } from '@/ui/input/image/components/ImageInput';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';
import {
  useRemoveWorkspaceLogoMutation,
  useUploadWorkspaceLogoMutation,
} from '~/generated/graphql';

export function WorkspaceLogoUploader() {
  const [uploadLogo] = useUploadWorkspaceLogoMutation();
  const [removeLogo] = useRemoveWorkspaceLogoMutation();
  const [currentUser] = useRecoilState(currentUserState);
  async function onUpload(file: File) {
    if (!file) {
      return;
    }
    await uploadLogo({
      variables: {
        file,
      },
      refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
    });
  }

  async function onRemove() {
    await removeLogo({
      refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
    });
  }

  return (
    <ImageInput
      picture={getImageAbsoluteURIOrBase64(
        currentUser?.workspaceMember?.workspace.logo,
      )}
      onUpload={onUpload}
      onRemove={onRemove}
    />
  );
}
