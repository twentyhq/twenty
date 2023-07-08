import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { ImageInput } from '@/ui/components/inputs/ImageInput';
import { GET_CURRENT_USER } from '@/users/services';
import { useUploadProfilePictureMutation } from '~/generated/graphql';

export function PictureUploader() {
  const [uploadPicture] = useUploadProfilePictureMutation();
  const [currentUser] = useRecoilState(currentUserState);
  async function onUpload(file: File) {
    await uploadPicture({
      variables: {
        file,
      },
      refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
    });
  }

  const pictureUrl = currentUser?.avatarUrl
    ? `${process.env.REACT_APP_FILES_URL}/${currentUser?.avatarUrl}`
    : null;
  return <ImageInput picture={pictureUrl} onUpload={onUpload} />;
}
