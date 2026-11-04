import { APPLICATION_CONNECTION_PROVIDER_FRAGMENT } from '@/settings/applications/graphql/fragments/applicationConnectionProviderFragment';
import { gql } from '@apollo/client';

export const FIND_APPLICATION_CONNECTION_PROVIDERS = gql`
  ${APPLICATION_CONNECTION_PROVIDER_FRAGMENT}
  query ApplicationConnectionProviders($applicationId: UUID!) {
    applicationConnectionProviders(applicationId: $applicationId) {
      ...ApplicationConnectionProviderFragment
    }
  }
`;
