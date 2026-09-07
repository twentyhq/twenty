import { gql } from '@apollo/client';

export const AUTHORIZE_APP = gql`
  mutation authorizeApp(
    $clientId: String!
    $codeChallenge: String
    $redirectUrl: String!
    $state: String
    $issuer: String
  ) {
    authorizeApp(
      clientId: $clientId
      codeChallenge: $codeChallenge
      redirectUrl: $redirectUrl
      state: $state
      issuer: $issuer
    ) {
      redirectUrl
    }
  }
`;
