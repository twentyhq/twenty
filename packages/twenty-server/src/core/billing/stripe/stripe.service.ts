import { Injectable } from '@nestjs/common';

import Stripe from 'stripe';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class StripeService {
  public readonly stripe: Stripe;

  constructor(private readonly environmentService: EnvironmentService) {
    this.stripe = new Stripe(
      this.environmentService.getBillingStripeApiKey(),
      {},
    );
  }

  constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret =
      this.environmentService.getBillingStripeWebhookSecret();

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
