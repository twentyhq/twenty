import { gql } from '@apollo/client';

export const RUN_APPLICATION_HEALTH_CHECK = gql`
  mutation RunApplicationHealthCheck($applicationId: UUID!) {
    runApplicationHealthCheck(applicationId: $applicationId) {
      status
      title
      description
      action {
        label
        location
      }
    }
  }
`;
