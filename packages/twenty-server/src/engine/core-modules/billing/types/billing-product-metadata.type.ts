/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

@ObjectType()
export class BillingProductMetadata {
  @Field(() => BillingPlanKey)
  planKey: BillingPlanKey;

  @Field(() => BillingUsageType)
  priceUsageBased: BillingUsageType;

  @Field(() => BillingProductKey)
  productKey: BillingProductKey;

  // Micro-credits each member gets per monthly slice, on monthly and yearly prices alike
  @Field(() => String, { nullable: true })
  memberCreditAmount?: string;

  // Superseded packaging: still billable for the subscriptions on it, never sold again.
  @Field(() => String, { nullable: true })
  isLegacy?: string;

  [key: string]: string | undefined;
}
