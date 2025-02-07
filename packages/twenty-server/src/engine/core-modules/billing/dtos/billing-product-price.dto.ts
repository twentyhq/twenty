/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import Stripe from 'stripe';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
@ObjectType()
export class BillingProductPriceDTO {
  @Field(() => SubscriptionInterval)
  recurringInterval: Stripe.Price.Recurring.Interval;

  @Field(() => Number)
  unitAmount: number;

  @Field(() => Number)
  created: number;

  @Field(() => String)
  stripePriceId: string;
}
