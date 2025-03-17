import { gql } from '@apollo/client';

export const GET_INDICATOR_HEALTH_STATUS = gql`
  query GetIndicatorHealthStatus($indicatorId: HealthIndicatorId!) {
    getIndicatorHealthStatus(indicatorId: $indicatorId) {
      id
      label
      description
      status
      errorMessage
      details
      queues {
        id
        queueName
        status
      }
    }
  }
`;
