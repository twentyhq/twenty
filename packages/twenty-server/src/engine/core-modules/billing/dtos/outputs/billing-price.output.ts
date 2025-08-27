/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

@ObjectType()
export class BillingPriceOutput {
  @Field(() => String)
  nickname: string;

  @Field(() => Number)
  amount: number;

  @Field(() => String)
  stripePriceId: string;

  @Field(() => SubscriptionInterval)
  interval: SubscriptionInterval;
}
