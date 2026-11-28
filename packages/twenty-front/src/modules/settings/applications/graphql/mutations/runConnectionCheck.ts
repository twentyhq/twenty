import { APPLICATION_HEALTH_CHECK_RESULT_FRAGMENT } from '@/applications/graphql/fragments/applicationHealthCheckResultFragment';
import { gql } from '@apollo/client';

export const RUN_CONNECTION_CHECK = gql`
  ${APPLICATION_HEALTH_CHECK_RESULT_FRAGMENT}
  mutation RunConnectionCheck($connectedAccountId: UUID!) {
    runConnectionCheck(connectedAccountId: $connectedAccountId) {
      ...ApplicationHealthCheckResultFields
    }
  }
`;
