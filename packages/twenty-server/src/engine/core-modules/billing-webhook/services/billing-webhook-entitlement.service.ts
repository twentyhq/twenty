/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import type Stripe from 'stripe';

import { BillingEntitlementSyncService } from 'src/engine/core-modules/billing-webhook/services/billing-entitlement-sync.service';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';

@Injectable()
export class BillingWebhookEntitlementService {
  constructor(
    // Stripe webhook: workspace discovered from BillingCustomer by stripeCustomerId.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
    private readonly billingEntitlementSyncService: BillingEntitlementSyncService,
  ) {}

  async processStripeEvent(
    data: Stripe.EntitlementsActiveEntitlementSummaryUpdatedEvent.Data,
  ) {
    const billingCustomer = await this.billingCustomerRepository.findOne({
      where: { stripeCustomerId: data.object.customer },
    });

    if (!billingCustomer) {
      throw new BillingException(
        'Billing customer not found',
        BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND,
      );
    }

    await this.billingEntitlementSyncService.syncEntitlements({
      workspaceId: billingCustomer.workspaceId,
      stripeCustomerId: data.object.customer,
      activeLookupKeys: data.object.entitlements.data.map(
        (entitlement) => entitlement.lookup_key,
      ),
    });

    return {
      stripeEntitlementCustomerId: data.object.customer,
    };
  }
}
