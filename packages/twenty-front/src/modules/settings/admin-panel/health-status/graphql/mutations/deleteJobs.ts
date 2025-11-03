import { gql } from '@apollo/client';

export const DELETE_JOBS = gql`
  mutation DeleteJobs($queueName: String!, $jobIds: [String!]!) {
    deleteJobs(queueName: $queueName, jobIds: $jobIds) {
      deletedCount
      results {
        jobId
        success
        error
      }
    }
  }
`;
