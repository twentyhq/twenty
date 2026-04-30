import { gql } from '@apollo/client';

export const GET_HYPER-PERSONALIZATION_DATA = gql`
  query GetHyperPersonalizationData {
    hyperpersonalizationData {
      id
    }
  }
`;

export const CREATE_HYPER-PERSONALIZATION_ITEM = gql`
  mutation CreateHyperPersonalizationItem($input: HyperPersonalizationInput!) {
    createHyperPersonalizationItem(input: $input) {
      id
    }
  }
`;

export const GET_HYPER-PERSONALIZATION_ANALYTICS = gql`
  query GetHyperPersonalizationAnalytics {
    hyperpersonalizationAnalytics {
      totalCount
      activeCount
    }
  }
`;
