/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingPriceTierDTO } from 'src/engine/core-modules/billing/dtos/billing-price-tier.dto';
import { BillingPriceTiersMode } from 'src/engine/core-modules/billing/enums/billing-price-tiers-mode.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

@ObjectType()
export class BillingPriceMeteredDTO {
  @Field(() => BillingPriceTiersMode, { nullable: true })
  tiersMode: BillingPriceTiersMode.GRADUATED | null;

  @Field(() => [BillingPriceTierDTO], { nullable: true })
  tiers: BillingPriceTierDTO[];

  @Field(() => SubscriptionInterval)
  recurringInterval: SubscriptionInterval;

  @Field(() => String)
  stripePriceId: string;

  @Field(() => BillingUsageType)
  priceUsageType: BillingUsageType.METERED;
}
