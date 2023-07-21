import { gql } from '@apollo/client';

export const UPDATE_USER = gql`
  mutation UpdateUser($data: UserUpdateInput!, $where: UserWhereUniqueInput!) {
    updateUser(data: $data, where: $where) {
      id
      email
      displayName
      firstName
      lastName
      avatarUrl
      workspaceMember {
        id
        workspace {
          id
          domainName
          displayName
          logo
          inviteHash
        }
      }
      settings {
        id
        locale
        colorScheme
      }
    }
  }
`;

export const UPDATE_PROFILE_PICTURE = gql`
  mutation UploadProfilePicture($file: Upload!) {
    uploadProfilePicture(file: $file)
  }
`;

export const REMOVE_PROFILE_PICTURE = gql`
  mutation RemoveProfilePicture($where: UserWhereUniqueInput!) {
    updateUser(data: { avatarUrl: null }, where: $where) {
      id
      avatarUrl
    }
  }
`;
