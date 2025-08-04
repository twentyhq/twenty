import { gql } from '@apollo/client';

import { timelineThreadWithTotalFragment } from '@/activities/emails/graphql/queries/fragments/timelineThreadWithTotalFragment';

export const getTimelineThreadsFromOpportunityId = gql`
  query GetTimelineThreadsFromOpportunityId(
    $opportunityId: UUID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineThreadsFromOpportunityId(
      opportunityId: $opportunityId
      page: $page
      pageSize: $pageSize
    ) {
      ...TimelineThreadsWithTotalFragment
    }
  }
  ${timelineThreadWithTotalFragment}
`;
