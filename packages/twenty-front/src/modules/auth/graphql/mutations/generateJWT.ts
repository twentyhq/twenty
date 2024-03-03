import { gql } from '@apollo/client';

export const GENERATE_JWT = gql`
  mutation GenerateJWT($workspaceId: String!) {
    generateJWT(workspaceId: $workspaceId) {
      tokens {
        ...AuthTokensFragment
      }
    }
  }
`;
