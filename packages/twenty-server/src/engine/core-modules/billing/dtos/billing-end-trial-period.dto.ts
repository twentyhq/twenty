/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

@ObjectType('BillingEndTrialPeriod')
export class BillingEndTrialPeriodDTO {
  @Field(() => SubscriptionStatus, {
    description: 'Updated subscription status',
    nullable: true,
  })
  status: SubscriptionStatus | undefined;

  @Field(() => Boolean, {
    description: 'Boolean that confirms if a payment method was found',
  })
  hasPaymentMethod: boolean;

  @Field(() => String, {
    description:
      'Billing portal URL for payment method update (returned when no payment method exists)',
    nullable: true,
  })
  billingPortalUrl?: string;

  @Field(() => BillingSubscriptionEntity, {
    description: 'Updated current billing subscription',
    nullable: true,
  })
  currentBillingSubscription?: BillingSubscriptionEntity;

  @Field(() => [BillingSubscriptionEntity], {
    description: 'All billing subscriptions',
    nullable: true,
  })
  billingSubscriptions?: BillingSubscriptionEntity[];
}
