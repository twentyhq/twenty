/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';

@Injectable()
export class BillingWebhookCustomerService {
  protected readonly logger = new Logger(BillingWebhookCustomerService.name);
  constructor(
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
  ) {}

  async processStripeEvent(data: Stripe.CustomerCreatedEvent.Data) {
    const { id: stripeCustomerId, metadata } = data.object;

    const workspaceId = metadata?.workspaceId;

    if (!workspaceId) {
      throw new BillingException(
        'Workspace ID is required for customer events',
        BillingExceptionCode.BILLING_CUSTOMER_EVENT_WORKSPACE_NOT_FOUND,
      );
    }

    await this.billingCustomerRepository.upsert(
      {
        stripeCustomerId,
        workspaceId,
      },
      {
        conflictPaths: ['workspaceId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }
}
