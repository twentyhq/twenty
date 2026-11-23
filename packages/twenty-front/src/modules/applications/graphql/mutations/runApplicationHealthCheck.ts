import { APPLICATION_HEALTH_CHECK_RESULT_FRAGMENT } from '@/applications/graphql/fragments/applicationHealthCheckResultFragment';
import { gql } from '@apollo/client';

export const RUN_APPLICATION_HEALTH_CHECK = gql`
  ${APPLICATION_HEALTH_CHECK_RESULT_FRAGMENT}
  mutation RunApplicationHealthCheck($applicationId: UUID!) {
    runApplicationHealthCheck(applicationId: $applicationId) {
      ...ApplicationHealthCheckResultFields
    }
  }
`;
