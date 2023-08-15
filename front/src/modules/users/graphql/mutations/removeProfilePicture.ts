import { gql } from '@apollo/client';

export const REMOVE_PROFILE_PICTURE = gql`
  mutation RemoveProfilePicture($where: UserWhereUniqueInput!) {
    updateUser(data: { avatarUrl: null }, where: $where) {
      id
      avatarUrl
    }
  }
`;
