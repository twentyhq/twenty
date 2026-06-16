/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingWebhookEvent } from 'src/engine/core-modules/billing/enums/billing-webhook-events.enum';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
@Injectable()
export class BillingWebhookCustomerService {
  protected readonly logger = new Logger(BillingWebhookCustomerService.name);
  constructor(
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepositoryUnscoped: Repository<BillingCustomerEntity>,
    private readonly stripeCustomerService: StripeCustomerService,
  ) {}

  async processStripeEvent(
    event:
      | Stripe.CustomerCreatedEvent
      | Stripe.PaymentMethodAttachedEvent
      | Stripe.PaymentMethodDetachedEvent,
  ) {
    if (event.type === BillingWebhookEvent.CUSTOMER_CREATED) {
      return this.processCustomerCreated(event.data);
    }

    if (event.type === BillingWebhookEvent.PAYMENT_METHOD_ATTACHED) {
      return this.processPaymentMethodAttachedEvent(event.data);
    }

    if (event.type === BillingWebhookEvent.PAYMENT_METHOD_DETACHED) {
      return this.processPaymentMethodDetachedEvent(event.data);
    }
  }

  private async processCustomerCreated(data: Stripe.CustomerCreatedEvent.Data) {
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

  private async processPaymentMethodAttachedEvent(
    data: Stripe.PaymentMethodAttachedEvent.Data,
  ) {
    const stripeCustomerId = this.extractStripeCustomerId(data.object.customer);

    if (!stripeCustomerId) {
      return {};
    }

    const workspaceId =
      await this.getWorkspaceIdFromStripeCustomerId(stripeCustomerId);

    if (!workspaceId) {
      return {};
    }

    await this.billingCustomerRepository.update(
      workspaceId,
      { stripeCustomerId },
      { hasPaymentMethod: true },
    );

  }

  private async processPaymentMethodDetachedEvent(
    data: Stripe.PaymentMethodDetachedEvent.Data,
  ) {

    const stripeCustomerId = this.extractStripeCustomerId(
      data.previous_attributes?.customer,
    );

    if (!stripeCustomerId) {
      return ;
    }

    const workspaceId =
      await this.getWorkspaceIdFromStripeCustomerId(stripeCustomerId);

    if (!workspaceId) {
      return ;
    }

    const hasPaymentMethod =
      await this.stripeCustomerService.hasPaymentMethod(stripeCustomerId);

    await this.billingCustomerRepository.update(
      workspaceId,
      { stripeCustomerId },
      { hasPaymentMethod },
    );

  }

  private async getWorkspaceIdFromStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<string | null> {
    const billingCustomer = await this.billingCustomerRepositoryUnscoped.findOne(
      {
        where: { stripeCustomerId },
        select: { workspaceId: true },
      },
    );

    return billingCustomer?.workspaceId ?? null;
  }

  private extractStripeCustomerId(
    customer:
      | string
      | Stripe.Customer
      | Stripe.DeletedCustomer
      | null
      | undefined,
  ): string | null {
    if (!customer) {
      return null;
    }

    return typeof customer === 'string' ? customer : customer.id;
  }
}
