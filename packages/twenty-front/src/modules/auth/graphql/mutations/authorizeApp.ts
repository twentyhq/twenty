import { gql } from '@apollo/client';

export const AUTHORIZEE_APP = gql`
  mutation authorizeApp($clientId: String!, $codeChallenge: String!) {
    authorizeApp(clientId: $clientId, codeChallenge: $codeChallenge) {
      redirectUrl
    }
  }
`;
