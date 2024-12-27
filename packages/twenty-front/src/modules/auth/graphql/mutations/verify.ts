import { gql } from '@apollo/client';

export const VERIFY = gql`
  mutation Verify($loginToken: String!) {
    verify(loginToken: $loginToken) {
      tokens {
        ...AuthTokensFragment
      }
    }
  }
`;
