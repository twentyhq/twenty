import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationRegistrationListingRequestStatus {
  NONE = 'none',
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

registerEnumType(ApplicationRegistrationListingRequestStatus, {
  name: 'ApplicationRegistrationListingRequestStatus',
});
