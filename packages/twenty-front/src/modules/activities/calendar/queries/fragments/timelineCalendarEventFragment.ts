import { gql } from '@apollo/client';

import { timelineCalendarEventAttendeeFragment } from '@/activities/calendar/queries/fragments/timelineCalendarEventAttendeeFragment';

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
    attendees {
      ...TimelineCalendarEventAttendeeFragment
    }
  }
  ${timelineCalendarEventAttendeeFragment}
`;
