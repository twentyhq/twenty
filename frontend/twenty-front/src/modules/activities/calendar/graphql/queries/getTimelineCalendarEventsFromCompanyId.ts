import { timelineCalendarEventWithTotalFragment } from '@/activities/calendar/graphql/queries/fragments/timelineCalendarEventWithTotalFragment';
import { gql } from '@apollo/client';

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
