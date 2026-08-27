import { gql } from '@apollo/client';

export const CREATE_CALENDAR_EVENT = gql`
  mutation CreateCalendarEvent($input: CreateCalendarEventInput!) {
    createCalendarEvent(input: $input) {
      success
      error
      iCalUid
      conferenceLink
    }
  }
`;
