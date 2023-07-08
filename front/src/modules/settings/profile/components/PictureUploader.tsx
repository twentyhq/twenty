import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { ImageInput } from '@/ui/components/inputs/ImageInput';
import { GET_CURRENT_USER } from '@/users/queries';
import { getProfilePictureAbsoluteURI } from '@/users/utils/getProfilePictureAbsoluteURI';
import {
  useRemoveProfilePictureMutation,
  useUploadProfilePictureMutation,
} from '~/generated/graphql';

export function PictureUploader() {
  const [uploadPicture] = useUploadProfilePictureMutation();
  const [removePicture] = useRemoveProfilePictureMutation();
  const [currentUser] = useRecoilState(currentUserState);
  async function onUpload(file: File) {
    if (!file) {
      return;
    }
    await uploadPicture({
      variables: {
        file,
      },
      refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
    });
  }

  async function onRemove() {
    await removePicture({
      variables: {
        where: {
          id: currentUser?.id,
        },
      },
      refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
    });
  }

  return (
    <ImageInput
      picture={getProfilePictureAbsoluteURI({
        avatarUrl: currentUser?.avatarUrl,
      })}
      onUpload={onUpload}
      onRemove={onRemove}
    />
  );
}
