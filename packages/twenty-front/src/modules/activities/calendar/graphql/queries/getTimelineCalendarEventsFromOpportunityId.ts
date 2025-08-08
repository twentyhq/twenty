import { gql } from '@apollo/client';

import { timelineCalendarEventWithTotalFragment } from '@/activities/calendar/graphql/queries/fragments/timelineCalendarEventWithTotalFragment';

export const getTimelineCalendarEventsFromOpportunityId = gql`
  query GetTimelineCalendarEventsFromOpportunityId(
    $opportunityId: UUID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineCalendarEventsFromOpportunityId(
      opportunityId: $opportunityId
      page: $page
      pageSize: $pageSize
    ) {
      ...TimelineCalendarEventsWithTotalFragment
    }
  }
  ${timelineCalendarEventWithTotalFragment}
`;
