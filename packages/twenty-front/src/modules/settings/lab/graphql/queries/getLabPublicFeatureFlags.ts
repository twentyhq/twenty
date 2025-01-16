import { gql } from '@apollo/client';
export const GET_LABS_PUBLIC_FEATURE_FLAGS = gql`
  query GetLabPublicFeatureFlags($workspaceId: String!) {
    getLabPublicFeatureFlags(workspaceId: $workspaceId) {
      id
      key
      value
      workspaceId
    }
  }
`;
