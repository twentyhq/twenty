import { gql } from '@apollo/client';

export const AUTH_TOKEN = gql`
  fragment AuthTokenFragment on AuthToken {
    token
    expiresAt
  }
`;

export const AUTH_TOKENS = gql`
  fragment AuthTokensFragment on AuthTokenPair {
    accessToken {
      ...AuthTokenFragment
    }
    refreshToken {
      ...AuthTokenFragment
    }
  }
`;
