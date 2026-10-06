/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingInvoicePaymentStatus } from 'src/engine/core-modules/billing/enums/billing-invoice-payment-status.enum';

@ObjectType('BillingCreditTopUp')
export class BillingCreditTopUpDTO {
  @Field(() => BillingInvoicePaymentStatus)
  status: BillingInvoicePaymentStatus;

  @Field(() => String, {
    description:
      'Stripe page where the customer completes a payment that needs their action',
    nullable: true,
  })
  hostedInvoiceUrl: string | null;

  @Field(() => BillingSubscriptionEntity, {
    description: 'Current billing subscription',
  })
  currentBillingSubscription: BillingSubscriptionEntity;

  @Field(() => [BillingSubscriptionEntity], {
    description: 'All billing subscriptions',
  })
  billingSubscriptions: BillingSubscriptionEntity[];
}
