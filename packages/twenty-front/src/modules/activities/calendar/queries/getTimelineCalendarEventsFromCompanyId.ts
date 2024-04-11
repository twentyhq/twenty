import { gql } from '@apollo/client';

import { timelineCalendarEventWithTotalFragment } from '@/activities/calendar/queries/fragments/timelineCalendarEventWithTotalFragment';

export const getTimelineCalendarEventsFromCompanyId = gql`
  query GetTimelineCalendarEventsFromCompanyId(
    $companyId: UUID!
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
