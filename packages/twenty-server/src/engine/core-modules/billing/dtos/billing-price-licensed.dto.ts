/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

@ObjectType('BillingPriceLicensed')
export class BillingPriceLicensedDTO {
  @Field(() => SubscriptionInterval)
  recurringInterval: SubscriptionInterval;

  @Field(() => Number)
  unitAmount: number;

  @Field(() => String)
  stripePriceId: string;

  @Field(() => Number, { nullable: true })
  creditAmount: number | null;

  @Field(() => Boolean)
  isSellable: boolean;
}
