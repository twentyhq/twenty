import { gql } from '@apollo/client';

export const GET_QUEUE_METRICS = gql`
  query GetQueueMetrics($queueName: String, $timeRange: String) {
    getQueueMetrics(queueName: $queueName, timeRange: $timeRange) {
      queueName
      timeRange
      details
      data {
        id
        color
        data {
          x
          y
        }
      }
    }
  }
`;
