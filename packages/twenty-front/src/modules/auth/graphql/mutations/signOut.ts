import { gql } from '@apollo/client';

export const SIGN_OUT = gql`
  mutation SignOut($refreshToken: String) {
    signOut(refreshToken: $refreshToken)
  }
`;
