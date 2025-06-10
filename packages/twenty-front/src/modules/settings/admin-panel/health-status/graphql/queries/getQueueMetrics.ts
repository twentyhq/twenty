import { gql } from '@apollo/client';

export const GET_QUEUE_METRICS = gql`
  query GetQueueMetrics(
    $queueName: String!
    $timeRange: QueueMetricsTimeRange
  ) {
    getQueueMetrics(queueName: $queueName, timeRange: $timeRange) {
      queueName
      timeRange
      workers
      details {
        failed
        completed
        waiting
        active
        delayed
        failureRate
      }
      data {
        id
        data {
          x
          y
        }
      }
    }
  }
`;
