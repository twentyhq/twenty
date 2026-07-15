import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationRegistrationListingRequestStatus {
  NONE = 'none',
  REQUESTED = 'requested',
  APPROVED = 'approved',
  CHANGE_REQUESTED = 'change_requested',
  REJECTED = 'rejected',
}

registerEnumType(ApplicationRegistrationListingRequestStatus, {
  name: 'ApplicationRegistrationListingRequestStatus',
});
