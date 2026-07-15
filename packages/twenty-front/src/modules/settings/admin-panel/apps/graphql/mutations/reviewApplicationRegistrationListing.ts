import { gql } from '@apollo/client';

import { APPLICATION_REGISTRATION_FRAGMENT } from '@/settings/application-registrations/graphql/fragments/applicationRegistrationFragment';

export const REVIEW_APPLICATION_REGISTRATION_LISTING = gql`
  mutation ReviewApplicationRegistrationListing(
    $applicationRegistrationId: String!
    $decision: ApplicationRegistrationListingReviewDecision!
    $reason: String
  ) {
    reviewApplicationRegistrationListing(
      applicationRegistrationId: $applicationRegistrationId
      decision: $decision
      reason: $reason
    ) {
      ...ApplicationRegistrationFragment
    }
  }
  ${APPLICATION_REGISTRATION_FRAGMENT}
`;
