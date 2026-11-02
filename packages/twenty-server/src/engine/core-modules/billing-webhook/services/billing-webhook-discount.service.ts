/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingDiscountService } from 'src/engine/core-modules/billing/services/billing-discount.service';
import { getStripeObjectId } from 'src/engine/core-modules/billing/utils/get-stripe-object-id.util';

@Injectable()
export class BillingWebhookDiscountService {
  constructor(
    // Stripe webhook: workspace discovered from BillingCustomer by stripeCustomerId.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
    private readonly billingDiscountService: BillingDiscountService,
  ) {}

  async processStripeEvent(
    data:
      | Stripe.CustomerDiscountCreatedEvent.Data
      | Stripe.CustomerDiscountUpdatedEvent.Data
      | Stripe.CustomerDiscountDeletedEvent.Data,
  ) {
    if (!isDefined(data.object.customer)) {
      return {};
    }

    const stripeCustomerId = getStripeObjectId(data.object.customer);

    const billingCustomer = await this.billingCustomerRepository.findOne({
      where: { stripeCustomerId },
    });

    if (!billingCustomer) {
      throw new BillingException(
        'Billing customer not found',
        BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND,
      );
    }

    await this.billingDiscountService.syncDiscountArrangement({
      workspaceId: billingCustomer.workspaceId,
      stripeCustomerId,
    });

    return { stripeCustomerId };
  }

  async processSubscriptionDeleted({
    workspaceId,
    subscription,
  }: {
    workspaceId: string;
    subscription: Pick<Stripe.Subscription, 'customer'>;
  }) {
    if (
      !(await this.billingDiscountService.hasActiveDiscountArrangement(
        workspaceId,
      ))
    ) {
      return;
    }

    await this.billingDiscountService.syncDiscountArrangement({
      workspaceId,
      stripeCustomerId: getStripeObjectId(subscription.customer),
    });
  }
}
