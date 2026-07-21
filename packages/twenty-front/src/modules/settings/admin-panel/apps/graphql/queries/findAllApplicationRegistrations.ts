import { gql } from '@apollo/client';

import { APPLICATION_REGISTRATION_FRAGMENT } from '@/settings/application-registrations/graphql/fragments/applicationRegistrationFragment';

export const FIND_ALL_APPLICATION_REGISTRATIONS = gql`
  query FindAllApplicationRegistrations(
    $limit: Int
    $offset: Int
    $searchTerm: String
    $isPreInstalledOnly: Boolean
  ) {
    findAllApplicationRegistrations(
      limit: $limit
      offset: $offset
      searchTerm: $searchTerm
      isPreInstalledOnly: $isPreInstalledOnly
    ) {
      registrations {
        ...ApplicationRegistrationFragment
      }
      hasMore
    }
  }
  ${APPLICATION_REGISTRATION_FRAGMENT}
`;
