import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_FEATURE_FLAG = gql`
  mutation UpdateWorkspaceFeatureFlag(
    $workspaceId: UUID!
    $featureFlag: String!
    $value: Boolean!
  ) {
    updateWorkspaceFeatureFlag(
      workspaceId: $workspaceId
      featureFlag: $featureFlag
      value: $value
    )
  }
`;
