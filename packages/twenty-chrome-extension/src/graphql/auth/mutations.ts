import { gql } from '@apollo/client';

export const EXCHANGE_AUTHORIZATION_CODE = gql`
  mutation ExchangeAuthorizationCode(
    $authorizationCode: String!
    $codeVerifier: String
    $clientSecret: String
  ) {
    exchangeAuthorizationCode(
      authorizationCode: $authorizationCode
      codeVerifier: $codeVerifier
      clientSecret: $clientSecret
    ) {
      loginToken {
        token
        expiresAt
      }
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
`;
