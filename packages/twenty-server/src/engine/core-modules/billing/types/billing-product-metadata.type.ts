/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';

@ObjectType()
export class BillingProductMetadata {
  @Field(() => BillingPlanKey, { nullable: true })
  planKey?: BillingPlanKey;

  @Field(() => BillingProductKey)
  productKey: BillingProductKey;

  // Superseded packaging: still billable for the subscriptions on it, never sold again.
  @Field(() => String, { nullable: true })
  isLegacy?: string;

  workspaceCreditsPerSeat?: string;

  [key: string]: string | undefined;
}
