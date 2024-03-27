import { gql } from '@apollo/client';

import { attendeeFragment } from '@/activities/calendar/queries/fragments/attendeeFragment';

export const calendarEventFragment = gql`
  fragment CalendarEventFragment on TimelineCalendarEvent {
    id
    title
    description
    location
    startsAt
    endsAt
    isFullDay
    visibility
    attendees {
      ...AttendeeFragment
    }
  }
  ${attendeeFragment}
`;
