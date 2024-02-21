import { gql } from '@apollo/client';

import { timelineThreadWithTotalFragment } from '@/activities/emails/queries/fragments/timelineThreadWithTotalFragment';

export const getTimelineThreadsFromCompanyId = gql`
  query GetTimelineThreadsFromCompanyId(
    $companyId: ID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineThreadsFromCompanyId(
      companyId: $companyId
      page: $page
      pageSize: $pageSize
    ) {
      ...TimelineThreadsWithTotalFragment
    }
  }
  ${timelineThreadWithTotalFragment}
`;
