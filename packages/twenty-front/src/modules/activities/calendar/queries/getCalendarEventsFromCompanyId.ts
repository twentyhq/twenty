import { gql } from '@apollo/client';

import { timelineCalendarEventWithTotalFragment } from '@/activities/calendar/queries/fragments/calendarEventFragmentWithTotalFragment';

export const getTimelineCalendarEventsFromCompanyId = gql`
  query GetTimelineCalendarEventsFromCompanyId(
    $companyId: ID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineCalendarEventsFromCompanyId(
      companyId: $companyId
      page: $page
      pageSize: $pageSize
    ) {
      ...TimelineCalendarEventsWithTotalFragment
    }
  }
  ${timelineCalendarEventWithTotalFragment}
`;
