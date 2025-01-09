import { gql } from '@apollo/client';

export const GET_FEATURE_FLAG_MANAGEMENT_CAPABILITY = gql`
  query GetFeatureFlagManagementCapability {
    getFeatureFlagManagementCapability
  }
`;
