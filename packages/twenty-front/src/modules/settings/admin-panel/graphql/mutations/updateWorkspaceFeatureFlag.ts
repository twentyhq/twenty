import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_FEATURE_FLAG = gql`
  mutation UpdateWorkspaceFeatureFlag(
    $workspaceId: String!
    $featureFlag: String!
    $value: Boolean!
    $isPublic: Boolean
  ) {
    updateWorkspaceFeatureFlag(
      workspaceId: $workspaceId
      featureFlag: $featureFlag
      value: $value
      isPublic: $isPublic
    )
  }
`;
