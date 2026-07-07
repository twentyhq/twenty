import { gql } from '@apollo/client';

import { APPLICATION_REGISTRATION_FRAGMENT } from '@/settings/application-registrations/graphql/fragments/applicationRegistrationFragment';

export const FIND_APPLICATION_REGISTRATION_LISTING_REQUESTS = gql`
  query FindApplicationRegistrationListingRequests {
    findApplicationRegistrationListingRequests {
      ...ApplicationRegistrationFragment
    }
  }
  ${APPLICATION_REGISTRATION_FRAGMENT}
`;
