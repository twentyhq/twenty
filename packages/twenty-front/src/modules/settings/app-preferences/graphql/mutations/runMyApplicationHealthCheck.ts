import { APPLICATION_HEALTH_CHECK_RESULT_FRAGMENT } from '@/applications/graphql/fragments/applicationHealthCheckResultFragment';
import { gql } from '@apollo/client';

export const RUN_MY_APPLICATION_HEALTH_CHECK = gql`
  ${APPLICATION_HEALTH_CHECK_RESULT_FRAGMENT}
  mutation RunMyApplicationHealthCheck($applicationId: UUID!) {
    runMyApplicationHealthCheck(applicationId: $applicationId) {
      ...ApplicationHealthCheckResultFields
    }
  }
`;
