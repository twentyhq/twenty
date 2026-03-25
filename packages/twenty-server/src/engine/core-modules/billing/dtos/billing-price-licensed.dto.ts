/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

@ObjectType('BillingPriceLicensed')
export class BillingPriceLicensedDTO {
  @Field(() => SubscriptionInterval)
  recurringInterval: SubscriptionInterval;

  @Field(() => Number)
  unitAmount: number;

  @Field(() => String)
  stripePriceId: string;

  @Field(() => BillingUsageType)
  priceUsageType: BillingUsageType.LICENSED;
}
