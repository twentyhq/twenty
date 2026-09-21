import { gql } from '@apollo/client';

export const RUN_APPLICATION_HEALTH_CHECK = gql`
  mutation RunApplicationHealthCheck($applicationId: UUID!) {
    runApplicationHealthCheck(applicationId: $applicationId) {
      status
      message
      action {
        label
        location
      }
    }
  }
`;
