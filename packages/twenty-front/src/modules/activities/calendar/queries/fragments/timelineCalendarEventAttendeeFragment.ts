import { gql } from '@apollo/client';

export const timelineCalendarEventAttendeeFragment = gql`
  fragment TimelineCalendarEventAttendeeFragment on TimelineCalendarEventAttendee {
    personId
    workspaceMemberId
    firstName
    lastName
    displayName
    avatarUrl
    handle
  }
`;
