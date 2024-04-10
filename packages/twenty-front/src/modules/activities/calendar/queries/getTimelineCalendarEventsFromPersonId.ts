import { gql } from '@apollo/client';

import { timelineCalendarEventWithTotalFragment } from '@/activities/calendar/queries/fragments/timelineCalendarEventWithTotalFragment';

export const getTimelineCalendarEventsFromPersonId = gql`
  query GetTimelineCalendarEventsFromPersonId(
    $personId: UUID!
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
