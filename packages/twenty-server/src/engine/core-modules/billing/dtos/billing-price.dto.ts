/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

@ObjectType('BillingPrice')
export class BillingPriceDTO {
  @Field(() => Number)
  upTo: number;

  @Field(() => Number)
  amount: number;

  @Field(() => String)
  stripePriceId: string;

  @Field(() => SubscriptionInterval)
  recurringInterval: SubscriptionInterval;
}
