import { Injectable } from '@nestjs/common';

import Stripe from 'stripe';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class StripeService {
  public readonly stripe: Stripe;

  constructor(private readonly environmentService: EnvironmentService) {
    this.stripe = new Stripe(this.environmentService.getStripeApiKey(), {});
  }
}
