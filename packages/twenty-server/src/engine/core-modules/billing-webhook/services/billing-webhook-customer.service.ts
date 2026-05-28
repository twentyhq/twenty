/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
@Injectable()
export class BillingWebhookCustomerService {
  protected readonly logger = new Logger(BillingWebhookCustomerService.name);
  constructor(
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
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
      workspaceId,
      { stripeCustomerId },
      {
        conflictPaths: ['workspaceId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }
}
