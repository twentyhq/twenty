import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationRegistrationVersionReviewState {
  UNREVIEWED = 'UNREVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(ApplicationRegistrationVersionReviewState, {
  name: 'ApplicationRegistrationVersionReviewState',
});
