import { gql } from '@apollo/client';

export const GET_AUTH_TOKENS_FROM_LOGIN_TOKEN = gql`
  mutation getAuthTokensFromLoginToken($loginToken: String!, $origin: String!) {
    getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
      tokens {
        ...AuthTokenPairFragment
      }
    }
  }
`;
