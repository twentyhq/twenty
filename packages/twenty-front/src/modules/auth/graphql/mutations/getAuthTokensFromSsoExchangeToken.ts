import { gql } from '@apollo/client';

export const GET_AUTH_TOKENS_FROM_SSO_EXCHANGE_TOKEN = gql`
  mutation getAuthTokensFromSsoExchangeToken($ssoExchangeToken: String!) {
    getAuthTokensFromSsoExchangeToken(ssoExchangeToken: $ssoExchangeToken) {
      tokens {
        ...AuthTokenPairFragment
      }
    }
  }
`;
