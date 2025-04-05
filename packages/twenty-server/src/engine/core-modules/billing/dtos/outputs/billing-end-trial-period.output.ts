/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

@ObjectType()
export class BillingEndTrialPeriodOutput {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was successful',
  })
  success: boolean;

  @Field(() => SubscriptionStatus, {
    description: 'Updated subscription status',
    nullable: true,
  })
  status?: SubscriptionStatus;

  @Field(() => Boolean, {
    description: 'Boolean that confirms if a payment method was found',
    nullable: true,
  })
  hasPaymentMethod: boolean;
}
