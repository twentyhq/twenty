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
    }
  }
`;
