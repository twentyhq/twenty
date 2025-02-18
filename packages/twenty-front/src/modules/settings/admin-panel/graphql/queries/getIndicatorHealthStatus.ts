import { gql } from '@apollo/client';

export const GET_INDICATOR_HEALTH_STATUS = gql`
  query GetIndicatorHealthStatus(
    $indicatorName: AdminPanelIndicatorHealthStatusInputEnum!
  ) {
    getIndicatorHealthStatus(indicatorName: $indicatorName) {
      status
      details
      queues {
        name
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
