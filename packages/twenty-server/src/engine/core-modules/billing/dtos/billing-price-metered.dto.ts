/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingPriceTierDTO } from 'src/engine/core-modules/billing/dtos/billing-price-tier.dto';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

@ObjectType('BillingPriceMetered')
export class BillingPriceMeteredDTO {
  @Field(() => [BillingPriceTierDTO])
  tiers: BillingPriceTierDTO[];

  @Field(() => SubscriptionInterval)
  recurringInterval: SubscriptionInterval;

  @Field(() => String)
  stripePriceId: string;

  @Field(() => BillingUsageType)
  priceUsageType: BillingUsageType.METERED;
}
