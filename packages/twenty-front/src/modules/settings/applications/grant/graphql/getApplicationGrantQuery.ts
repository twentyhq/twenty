import { APPLICATION_GRANT_FRAGMENT } from '@/settings/applications/grant/graphql/applicationGrantFragment';
import { gql } from '@apollo/client';

export const GET_APPLICATION_GRANT = gql`
  ${APPLICATION_GRANT_FRAGMENT}
  query GetApplicationGrant($applicationId: UUID!) {
    applicationGrant(applicationId: $applicationId) {
      ...ApplicationGrantFragment
    }
  }
`;
