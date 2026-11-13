import { gql } from '@apollo/client';

export const AUTHORIZE_APP = gql`
  mutation authorizeApp(
    $clientId: String!
    $codeChallenge: String
    $redirectUrl: String!
    $state: String
    $issuer: String
    $resource: String
  ) {
    authorizeApp(
      clientId: $clientId
      codeChallenge: $codeChallenge
      redirectUrl: $redirectUrl
      state: $state
      issuer: $issuer
      resource: $resource
    ) {
      redirectUrl
    }
  }
`;
