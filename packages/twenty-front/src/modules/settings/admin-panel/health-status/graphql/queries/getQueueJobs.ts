import { gql } from '@apollo/client';

export const GET_QUEUE_JOBS = gql`
  query GetQueueJobs(
    $queueName: String!
    $state: JobState
    $limit: Float
    $offset: Float
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
        returnvalue
        logs
        stacktrace
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
