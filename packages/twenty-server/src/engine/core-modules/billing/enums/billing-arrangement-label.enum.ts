/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingArrangementLabel {
  APP_OWNER_WORKSPACE = 'APP_OWNER_WORKSPACE',
  COMPENSATION = 'COMPENSATION',
  OTHER = 'OTHER',
}

registerEnumType(BillingArrangementLabel, {
  name: 'BillingArrangementLabel',
  description: 'Why a billing arrangement was granted, used for reporting',
});
