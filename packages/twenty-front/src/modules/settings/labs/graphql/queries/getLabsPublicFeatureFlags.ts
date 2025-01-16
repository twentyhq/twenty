import { gql } from '@apollo/client';
export const GET_LABS_PUBLIC_FEATURE_FLAGS = gql`
  query GetLabsPublicFeatureFlags($workspaceId: String!) {
    getLabsPublicFeatureFlags(workspaceId: $workspaceId) {
      id
      key
      value
      workspaceId
    }
  }
`;
