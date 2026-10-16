/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingPlanKey {
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
  PRO_V2 = 'PRO_V2',
  ORGANIZATION_V2 = 'ORGANIZATION_V2',
}

registerEnumType(BillingPlanKey, {
  name: 'BillingPlanKey',
  description: 'The different billing plans available',
});
