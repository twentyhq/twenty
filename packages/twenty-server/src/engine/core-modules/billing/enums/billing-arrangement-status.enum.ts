/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingArrangementStatus {
  ACTIVE = 'ACTIVE',
  SCHEDULED = 'SCHEDULED',
  ENDED = 'ENDED',
  ONE_TIME = 'ONE_TIME',
}

registerEnumType(BillingArrangementStatus, {
  name: 'BillingArrangementStatus',
  description:
    'Whether a billing arrangement applies now, later, no longer, or only once',
});
