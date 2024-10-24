import { gql } from '@apollo/client';

export const GENERATE_JWT = gql`
  mutation GenerateJWT($workspaceId: String!) {
    generateJWT(workspaceId: $workspaceId) {
      ... on GenerateJWTOutputWithAuthTokens {
        success
        reason
        authTokens {
          tokens {
            ...AuthTokensFragment
          }
        }
      }
      ... on GenerateJWTOutputWithSSOAUTH {
        success
        reason
        availableSSOIDPs {
          ...AvailableSSOIdentityProvidersFragment
        }
      }
    }
  }
`;
