/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';

@ObjectType()
export class BillingUpdateOutput {
  @Field(() => BillingSubscriptionEntity, {
    description: 'Current billing subscription',
  })
  currentBillingSubscription: BillingSubscriptionEntity;

  @Field(() => [BillingSubscriptionEntity], {
    description: 'All billing subscriptions',
  })
  billingSubscriptions: BillingSubscriptionEntity[];
}
