import { gql } from '@apollo/client';

export const timelineCalendarEventParticipantFragment = gql`
  fragment TimelineCalendarEventParticipantFragment on TimelineCalendarEventParticipant {
    id
    personId
    workspaceMemberId
    firstName
    lastName
    displayName
    avatarUrl
    handle
  }
`;
