import { gql } from '@apollo/client';

export const GET_INCIDENTS_DATA = gql`
  query GetIncidentsData {
    incidentsData {
      id
    }
  }
`;

export const CREATE_INCIDENTS_ITEM = gql`
  mutation CreateIncidentsItem($input: IncidentsInput!) {
    createIncidentsItem(input: $input) {
      id
    }
  }
`;

export const GET_INCIDENTS_ANALYTICS = gql`
  query GetIncidentsAnalytics {
    incidentsAnalytics {
      totalCount
      activeCount
    }
  }
`;
