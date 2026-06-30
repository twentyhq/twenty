/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingPlanKey {
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

registerEnumType(BillingPlanKey, {
  name: 'BillingPlanKey',
  description: 'The different billing plans available',
});
