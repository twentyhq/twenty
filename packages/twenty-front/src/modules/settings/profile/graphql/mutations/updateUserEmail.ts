import { gql } from '@apollo/client';

export const UPDATE_USER_EMAIL = gql`
  mutation UpdateUserEmail(
    $newEmail: String!
    $verifyEmailRedirectPath: String
  ) {
    updateUserEmail(
      newEmail: $newEmail
      verifyEmailRedirectPath: $verifyEmailRedirectPath
    )
  }
`;
