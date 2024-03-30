import { gql } from '@apollo/client';

export const AUTHORIZE_APP = gql`
  mutation authorizeApp($clientId: String!, $codeChallenge: String!) {
    authorizeApp(clientId: $clientId, codeChallenge: $codeChallenge) {
      redirectUrl
    }
  }
`;
