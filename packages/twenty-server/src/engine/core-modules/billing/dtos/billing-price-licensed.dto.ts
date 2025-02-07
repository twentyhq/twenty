/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

@ObjectType()
export class BillingPriceLicensedDTO {
  @Field(() => SubscriptionInterval)
  recurringInterval: SubscriptionInterval;

  @Field(() => Number)
  unitAmount: number;

  @Field(() => String)
  stripePriceId: string;
}
