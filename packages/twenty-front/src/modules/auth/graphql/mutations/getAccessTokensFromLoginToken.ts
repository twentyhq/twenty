import { gql } from '@apollo/client';

export const GET_ACCESS_TOKENS_FROM_LOGIN_TOKEN = gql`
  mutation GetAccessTokensFromLoginToken(
    $loginToken: String!
    $origin: String!
  ) {
    getAccessTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
      tokens {
        ...AuthTokensFragment
      }
    }
  }
`;
