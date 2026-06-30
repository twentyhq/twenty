import { gql } from '@apollo/client';

export const UPDATE_CALENDAR_CHANNEL = gql`
  mutation UpdateCalendarChannel($input: UpdateCalendarChannelInput!) {
    updateCalendarChannel(input: $input) {
      id
      visibility
      isContactAutoCreationEnabled
      contactAutoCreationPolicy
    }
  }
`;
