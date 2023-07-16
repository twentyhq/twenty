import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { AttachmentsInput } from '@/ui/components/inputs/AttachmentsInput';
import { GET_CURRENT_USER } from '@/users/queries';
import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';
import {
  useRemoveWorkspaceLogoMutation,
  useUploadWorkspaceLogoMutation,
} from '~/generated/graphql';

export function CommentThreadAttachments() {
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
    <AttachmentsInput
      picture={getImageAbsoluteURIOrBase64(
        currentUser?.workspaceMember?.workspace.logo,
      )}
      onUpload={onUpload}
      onRemove={onRemove}
    />
  );
}
