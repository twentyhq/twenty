/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import type Stripe from 'stripe';

import { transformStripeEntitlementUpdatedEventToDatabaseEntitlement } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-entitlement-updated-event-to-database-entitlement.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';

@Injectable()
export class BillingWebhookEntitlementService {
  constructor(
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
    @InjectRepository(BillingEntitlementEntity)
    private readonly billingEntitlementRepository: Repository<BillingEntitlementEntity>,
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
