import { gql } from '@apollo/client';

export const VERIFY = gql`
  mutation Verify($loginToken: String!) {
    verify(loginToken: $loginToken) {
      user {
        ...UserQueryFragment
      }
      tokens {
        accessToken {
          token
          expiresAt
        }
        refreshToken {
          token
          expiresAt
        }
      }
    }
  }
`;
