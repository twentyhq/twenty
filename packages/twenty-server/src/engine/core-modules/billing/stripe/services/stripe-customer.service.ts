/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import type Stripe from 'stripe';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class StripeCustomerService {
  protected readonly logger = new Logger(StripeCustomerService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly stripeSDKService: StripeSDKService,
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
  ) {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }
    this.stripe = this.stripeSDKService.getStripe(
      this.twentyConfigService.get('BILLING_STRIPE_API_KEY'),
    );
  }

  async updateCustomerMetadataWorkspaceId(
    stripeCustomerId: string,
    workspaceId: string,
  ) {
    await this.stripe.customers.update(stripeCustomerId, {
      metadata: { workspaceId: workspaceId },
    });
  }

  async hasPaymentMethod(stripeCustomerId: string) {
    const { data: paymentMethods } =
      await this.stripe.customers.listPaymentMethods(stripeCustomerId);

    return paymentMethods.length > 0;
  }

  async createStripeCustomer(
    userEmail: string,
    workspaceId: string,
    customerName: string | undefined,
  ) {
    const customer = await this.stripe.customers.create({
      name: customerName,
      email: userEmail,
      metadata: {
        workspaceId,
      },
    });

    await this.billingCustomerRepository.save({
      stripeCustomerId: customer.id,
      workspaceId,
    });

    return customer;
  }
}
