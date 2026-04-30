import { gql } from '@apollo/client';

export const GET_PLG-INTELLIGENCE_DATA = gql`
  query GetPlgIntelligenceData {
    plgintelligenceData {
      id
    }
  }
`;

export const CREATE_PLG-INTELLIGENCE_ITEM = gql`
  mutation CreatePlgIntelligenceItem($input: PlgIntelligenceInput!) {
    createPlgIntelligenceItem(input: $input) {
      id
    }
  }
`;

export const GET_PLG-INTELLIGENCE_ANALYTICS = gql`
  query GetPlgIntelligenceAnalytics {
    plgintelligenceAnalytics {
      totalCount
      activeCount
    }
  }
`;
