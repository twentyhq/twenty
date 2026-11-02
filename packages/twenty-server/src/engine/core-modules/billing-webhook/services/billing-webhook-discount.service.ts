/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isString } from '@sniptt/guards';
import { Repository } from 'typeorm';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingCouponService } from 'src/engine/core-modules/billing/services/billing-coupon.service';

@Injectable()
export class BillingWebhookDiscountService {
  constructor(
    // Stripe webhook: workspace discovered from BillingCustomer by stripeCustomerId.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
    private readonly billingCouponService: BillingCouponService,
  ) {}

  async processStripeEvent(
    data:
      | Stripe.CustomerDiscountCreatedEvent.Data
      | Stripe.CustomerDiscountUpdatedEvent.Data
      | Stripe.CustomerDiscountDeletedEvent.Data,
  ) {
    const { customer } = data.object;

    if (!isString(customer)) {
      return {};
    }

    const billingCustomer = await this.billingCustomerRepository.findOne({
      where: { stripeCustomerId: customer },
    });

    if (!billingCustomer) {
      throw new BillingException(
        'Billing customer not found',
        BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND,
      );
    }

    await this.billingCouponService.syncCouponArrangement({
      workspaceId: billingCustomer.workspaceId,
      stripeCustomerId: customer,
    });

    return { stripeCustomerId: customer };
  }

  async processSubscriptionDeleted({
    workspaceId,
    subscription,
  }: {
    workspaceId: string;
    subscription: Stripe.Subscription;
  }) {
    if (
      !(await this.billingCouponService.hasActiveCouponArrangement(workspaceId))
    ) {
      return;
    }

    await this.billingCouponService.syncCouponArrangement({
      workspaceId,
      stripeCustomerId: isString(subscription.customer)
        ? subscription.customer
        : subscription.customer.id,
    });
  }
}
