import { User } from '~/generated/graphql';

export function getProfilePictureAbsoluteURI(
  currentUser: Pick<User, 'avatarUrl'>,
) {
  return currentUser?.avatarUrl
    ? `${process.env.REACT_APP_FILES_URL}/${currentUser?.avatarUrl}`
    : null;
}
