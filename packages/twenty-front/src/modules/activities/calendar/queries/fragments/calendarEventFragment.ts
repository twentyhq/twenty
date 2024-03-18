import { gql } from '@apollo/client';

import { attendeeFragment } from '@/activities/calendar/queries/fragments/attendeeFragment';

export const calendarEventFragment = gql`
  fragment CalendarEventFragment on TimelineCalendarEvent {
    id
    title
    description
    location
    startDate
    endDate
    isFullDay
    attendees {
      ...AttendeeFragment
    }
  }
  ${attendeeFragment}
`;
