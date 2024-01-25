import { gql } from '@apollo/client';

import { timelineThreadFragment } from '@/activities/emails/queries/fragments/timelineThreadFragment';

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
      ...TimelineThreadFragment
    }
  }
  ${timelineThreadFragment}
`;
