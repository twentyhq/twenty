import { gql } from '@apollo/client';

export const UPDATE_LAB_PUBLIC_FEATURE_FLAG = gql`
  mutation UpdateLabPublicFeatureFlag(
    $input: UpdateLabPublicFeatureFlagInput!
  ) {
    updateLabPublicFeatureFlag(input: $input) {
      key
      value
    }
  }
`;
