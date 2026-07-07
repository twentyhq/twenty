import { gql } from '@apollo/client';

import { APPLICATION_REGISTRATION_FRAGMENT } from '@/settings/application-registrations/graphql/fragments/applicationRegistrationFragment';

export const REQUEST_APPLICATION_REGISTRATION_LISTING = gql`
  mutation RequestApplicationRegistrationListing(
    $applicationRegistrationId: String!
  ) {
    requestApplicationRegistrationListing(
      applicationRegistrationId: $applicationRegistrationId
    ) {
      ...ApplicationRegistrationFragment
    }
  }
  ${APPLICATION_REGISTRATION_FRAGMENT}
`;
