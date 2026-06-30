import { gql } from '@apollo/client';

export const RETRY_JOBS = gql`
  mutation RetryJobs($queueName: String!, $jobIds: [String!]!) {
    retryJobs(queueName: $queueName, jobIds: $jobIds) {
      retriedCount
      results {
        jobId
        success
        error
      }
    }
  }
`;
