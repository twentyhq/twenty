import { gql } from '@apollo/client';

export const UPDATE_LAB_PUBLIC_FEATURE_FLAG = gql`
  mutation UpdateLabPublicFeatureFlag(
    $workspaceId: String!
    $publicFeatureFlag: String!
    $value: Boolean!
  ) {
    updateLabPublicFeatureFlag(
      workspaceId: $workspaceId
      publicFeatureFlag: $publicFeatureFlag
      value: $value
    )
  }
`;
