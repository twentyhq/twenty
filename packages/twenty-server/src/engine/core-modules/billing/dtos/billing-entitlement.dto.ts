/* @license Enterprise */

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

registerEnumType(BillingEntitlementKey, {
  name: 'BillingEntitlementKey',
});

@ObjectType('BillingEntitlement')
export class BillingEntitlementDTO {
  @Field(() => BillingEntitlementKey)
  key: BillingEntitlementKey;

  @Field(() => Boolean)
  value: boolean;
}
