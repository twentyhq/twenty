import { gql } from '@apollo/client';

import { APPLICATION_REGISTRATION_FRAGMENT } from '@/settings/application-registrations/graphql/fragments/applicationRegistrationFragment';

export const REVIEW_APPLICATION_REGISTRATION_LISTING = gql`
  mutation ReviewApplicationRegistrationListing(
    $applicationRegistrationId: String!
    $approved: Boolean!
  ) {
    reviewApplicationRegistrationListing(
      applicationRegistrationId: $applicationRegistrationId
      approved: $approved
    ) {
      ...ApplicationRegistrationFragment
    }
  }
  ${APPLICATION_REGISTRATION_FRAGMENT}
`;
