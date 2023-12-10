import { gql } from '@apollo/client';

export const CHECK_USER_EXISTS = gql`
  query CheckUserExists($email: String!) {
    checkUserExists(email: $email) {
      exists
    }
  }
`;
