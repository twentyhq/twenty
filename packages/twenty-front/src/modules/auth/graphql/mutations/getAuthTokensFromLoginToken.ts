import { gql } from '@apollo/client';

export const GET_AUTH_TOKENS_FROM_LOGIN_TOKEN = gql`
  mutation GetAuthTokensFromLoginToken($loginToken: String!) {
    getAuthTokensFromLoginToken(loginToken: $loginToken) {
      tokens {
        ...AuthTokensFragment
      }
    }
  }
`;
