import { gql } from '@apollo/client';

export const UPDATE_LABS_PUBLIC_FEATURE_FLAG = gql`
  mutation UpdateLabsPublicFeatureFlag(
    $workspaceId: String!
    $publicFeatureFlag: String!
    $value: Boolean!
  ) {
    updateLabsPublicFeatureFlag(
      workspaceId: $workspaceId
      publicFeatureFlag: $publicFeatureFlag
      value: $value
    )
  }
`;
