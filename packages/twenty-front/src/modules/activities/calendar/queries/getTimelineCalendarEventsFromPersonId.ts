import { gql } from '@apollo/client';

import { timelineCalendarEventWithTotalFragment } from '@/activities/calendar/queries/fragments/calendarEventFragmentWithTotalFragment';

export const getTimelineCalendarEventsFromPersonId = gql`
  query GetTimelineCalendarEventsFromPersonId(
    $personId: ID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineCalendarEventsFromPersonId(
      personId: $personId
      page: $page
      pageSize: $pageSize
    ) {
      ...TimelineCalendarEventsWithTotalFragment
    }
  }
  ${timelineCalendarEventWithTotalFragment}
`;
