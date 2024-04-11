import { gql } from '@apollo/client';

import { timelineCalendarEventParticipantFragment } from '@/activities/calendar/queries/fragments/timelineCalendarEventParticipantFragment';

export const timelineCalendarEventFragment = gql`
  fragment TimelineCalendarEventFragment on TimelineCalendarEvent {
    id
    title
    description
    location
    startsAt
    endsAt
    isFullDay
    visibility
    participants {
      ...TimelineCalendarEventParticipantFragment
    }
  }
  ${timelineCalendarEventParticipantFragment}
`;
