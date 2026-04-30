import { gql } from '@apollo/client';

export const GET_EVENTS_DATA = gql`
  query GetEventsData {
    eventsData {
      id
    }
  }
`;

export const CREATE_EVENTS_ITEM = gql`
  mutation CreateEventsItem($input: EventsInput!) {
    createEventsItem(input: $input) {
      id
    }
  }
`;

export const GET_EVENTS_ANALYTICS = gql`
  query GetEventsAnalytics {
    eventsAnalytics {
      totalCount
      activeCount
    }
  }
`;
