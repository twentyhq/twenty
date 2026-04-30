import { gql } from '@apollo/client';

export const GET_GAMIFICATION_DATA = gql`
  query GetGamificationData {
    gamificationData {
      id
    }
  }
`;

export const CREATE_GAMIFICATION_ITEM = gql`
  mutation CreateGamificationItem($input: GamificationInput!) {
    createGamificationItem(input: $input) {
      id
    }
  }
`;

export const GET_GAMIFICATION_ANALYTICS = gql`
  query GetGamificationAnalytics {
    gamificationAnalytics {
      totalCount
      activeCount
    }
  }
`;
