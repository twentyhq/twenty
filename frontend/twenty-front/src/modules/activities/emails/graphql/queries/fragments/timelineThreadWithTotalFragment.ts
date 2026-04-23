import { timelineThreadFragment } from '@/activities/emails/graphql/queries/fragments/timelineThreadFragment';
import { gql } from '@apollo/client';

export const timelineThreadWithTotalFragment = gql`
  fragment TimelineThreadsWithTotalFragment on TimelineThreadsWithTotal {
    totalNumberOfThreads
    timelineThreads {
      ...TimelineThreadFragment
    }
  }
  ${timelineThreadFragment}
`;
