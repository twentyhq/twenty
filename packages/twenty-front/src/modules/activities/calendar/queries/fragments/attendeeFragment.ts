import { gql } from '@apollo/client';

export const attendeeFragment = gql`
  fragment AttendeeFragment on TimelineCalendarEventAttendee {
    personId
    workspaceMemberId
    firstName
    lastName
    displayName
    avatarUrl
    handle
  }
`;
