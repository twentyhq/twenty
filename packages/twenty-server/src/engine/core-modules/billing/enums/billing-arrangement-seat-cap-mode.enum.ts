/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingArrangementSeatCapMode {
  SOFT = 'SOFT',
  HARD = 'HARD',
}

registerEnumType(BillingArrangementSeatCapMode, {
  name: 'BillingArrangementSeatCapMode',
  description: 'Whether members above committed seats are billed or blocked',
});
