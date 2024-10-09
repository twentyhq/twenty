import { gql } from '@apollo/client';

export const GENERATE_JWT = gql`
  mutation GenerateJWT($workspaceId: String!) {
    generateJWT(workspaceId: $workspaceId) {
      ... on GenerateJWTOutputWithAuthTokens {
        success
        reason
        authTokens: payload {
          tokens {
            ...AuthTokensFragment
          }
        }
      }
      ... on GenerateJWTOutputWithSSOAUTH {
        success
        reason
        availableSSOIDPs: payload {
          id
          issuer
          name
          status
          workspace {
            id
            displayName
          }
        }
      }
    }
  }
`;
