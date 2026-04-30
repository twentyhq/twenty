import { gql } from '@apollo/client';

export const GET_IT-ASSET-MANAGEMENT_DATA = gql`
  query GetItAssetManagementData {
    itassetmanagementData {
      id
    }
  }
`;

export const CREATE_IT-ASSET-MANAGEMENT_ITEM = gql`
  mutation CreateItAssetManagementItem($input: ItAssetManagementInput!) {
    createItAssetManagementItem(input: $input) {
      id
    }
  }
`;

export const GET_IT-ASSET-MANAGEMENT_ANALYTICS = gql`
  query GetItAssetManagementAnalytics {
    itassetmanagementAnalytics {
      totalCount
      activeCount
    }
  }
`;
