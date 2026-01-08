/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

@ObjectType()
export class BillingEndTrialPeriodOutput {
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
}
