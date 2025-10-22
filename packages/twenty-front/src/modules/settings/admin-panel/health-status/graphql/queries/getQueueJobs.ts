import { gql } from '@apollo/client';

export const GET_QUEUE_JOBS = gql`
  query GetQueueJobs(
    $queueName: String!
    $state: JobState!
    $limit: Int
    $offset: Int
  ) {
    getQueueJobs(
      queueName: $queueName
      state: $state
      limit: $limit
      offset: $offset
    ) {
      jobs {
        id
        name
        data
        state
        timestamp
        failedReason
        processedOn
        finishedOn
        attemptsMade
        returnValue
        logs
        stackTrace
      }
      count
      totalCount
      hasMore
      retentionConfig {
        completedMaxAge
        completedMaxCount
        failedMaxAge
        failedMaxCount
      }
    }
  }
`;
