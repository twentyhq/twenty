import { gql } from '@apollo/client';

export const GET_INDICATOR_HEALTH_STATUS = gql`
  query GetIndicatorHealthStatus($indicatorId: HealthIndicatorId!) {
    getIndicatorHealthStatus(indicatorId: $indicatorId) {
      id
      label
      description
      status
      details
      queues {
        id
        queueName
        status
        workers
        metrics {
          failed
          completed
          waiting
          active
          delayed
          prioritized
        }
      }
    }
  }
`;
