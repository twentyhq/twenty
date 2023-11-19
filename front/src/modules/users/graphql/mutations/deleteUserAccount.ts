import { gql } from '@apollo/client';

export const DELETE_USER_ACCOUNT = gql`
  mutation DeleteUserAccount {
    deleteUser {
      id
    }
  }
`;
