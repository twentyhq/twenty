/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Stripe from 'stripe';
import { Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { transformStripeEntitlementUpdatedEventToDatabaseEntitlement } from 'src/engine/core-modules/billing/webhooks/utils/transform-stripe-entitlement-updated-event-to-database-entitlement.util';
@Injectable()
export class BillingWebhookEntitlementService {
  protected readonly logger = new Logger(BillingWebhookEntitlementService.name);
  constructor(
    @InjectRepository(BillingCustomer, 'core')
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    @InjectRepository(BillingEntitlement, 'core')
    private readonly billingEntitlementRepository: Repository<BillingEntitlement>,
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

    const workspaceId = billingCustomer.workspaceId;

    await this.billingEntitlementRepository.upsert(
      transformStripeEntitlementUpdatedEventToDatabaseEntitlement(
        workspaceId,
        data,
      ),
      {
        conflictPaths: ['workspaceId', 'key'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    return {
      stripeEntitlementCustomerId: data.object.customer,
    };
  }
}
