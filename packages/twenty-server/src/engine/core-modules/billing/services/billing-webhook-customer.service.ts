import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Stripe from 'stripe';
import { Repository } from 'typeorm';

import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
@Injectable()
export class BillingWebhookCustomerService {
  protected readonly logger = new Logger(BillingWebhookCustomerService.name);
  constructor(
    @InjectRepository(BillingCustomer, 'core')
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
  ) {}

  async processStripeCustomerEvent(
    stripeCustomerId: string,
    data:
      | Stripe.CustomerCreatedEvent.Data
      | Stripe.CustomerDeletedEvent.Data
      | Stripe.CustomerUpdatedEvent.Data,
  ) {
    const stripeMetadataWorkspaceId = data.object.metadata?.workspaceId;
    const billingCustomer = await this.billingCustomerRepository.findOne({
      where: { stripeCustomerId },
    });

    if (!billingCustomer && !stripeMetadataWorkspaceId) {
      return; //do nothing
    }
    if (billingCustomer && !stripeMetadataWorkspaceId) {
      return billingCustomer.workspaceId; //send stripe to update (stripe customer metadata is not yet up to date)
    }
    await this.billingCustomerRepository.upsert(
      {
        workspaceId: stripeMetadataWorkspaceId,
        stripeCustomerId: data.object.id,
      },
      {
        conflictPaths: ['workspaceId', 'stripeCustomerId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }

  async verifyStripeCustomerMetadata(stripeCustomer: Stripe.Customer) {
    const billingCustomer = await this.billingCustomerRepository.findOne({
      where: { stripeCustomerId: stripeCustomer.id },
    });

    if (!billingCustomer) {
      return;
    }

    const stripeMetadataWorkspaceId = stripeCustomer.metadata?.workspaceId;

    if (!stripeMetadataWorkspaceId) {
      return billingCustomer.workspaceId;
    }

    return;
  }
}
