import { gql } from '@apollo/client';

export const GET_ABM_DATA = gql`
  query GetAbmData {
    abmData {
      id
    }
  }
`;

export const CREATE_ABM_ITEM = gql`
  mutation CreateAbmItem($input: AbmInput!) {
    createAbmItem(input: $input) {
      id
    }
  }
`;

export const GET_ABM_ANALYTICS = gql`
  query GetAbmAnalytics {
    abmAnalytics {
      totalCount
      activeCount
    }
  }
`;
