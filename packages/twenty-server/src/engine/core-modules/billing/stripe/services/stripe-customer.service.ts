/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import type Stripe from 'stripe';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
@Injectable()
export class StripeCustomerService {
  protected readonly logger = new Logger(StripeCustomerService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly stripeSDKService: StripeSDKService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
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

    await this.billingCustomerRepository.save(workspaceId, {
      stripeCustomerId: customer.id,
      hasPaymentMethod: false,
    });

    return customer;
  }
}
