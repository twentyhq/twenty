import { Injectable } from '@nestjs/common';

import Stripe from 'stripe';

@Injectable()
export class StripeSDKService {
  getStripe(stripeApiKey: string) {
    return new Stripe(stripeApiKey, {});
  }
}
