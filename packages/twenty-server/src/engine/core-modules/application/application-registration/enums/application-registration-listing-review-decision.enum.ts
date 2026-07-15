import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationRegistrationListingReviewDecision {
  APPROVED = 'approved',
  CHANGE_REQUESTED = 'change_requested',
  REJECTED = 'rejected',
}

registerEnumType(ApplicationRegistrationListingReviewDecision, {
  name: 'ApplicationRegistrationListingReviewDecision',
});
