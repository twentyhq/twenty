/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';

@ObjectType()
export class BillingUpdateOutput {
  @Field(() => BillingSubscription, {
    description: 'Current billing subscription',
  })
  currentBillingSubscription: BillingSubscription;

  @Field(() => [BillingSubscription], {
    description: 'All billing subscriptions',
  })
  billingSubscriptions: BillingSubscription[];
}
