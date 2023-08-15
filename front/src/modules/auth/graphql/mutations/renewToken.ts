import { gql } from '@apollo/client';

export const RENEW_TOKEN = gql`
  mutation RenewToken($refreshToken: String!) {
    renewToken(refreshToken: $refreshToken) {
      tokens {
        accessToken {
          expiresAt
          token
        }
        refreshToken {
          token
          expiresAt
        }
      }
    }
  }
`;
