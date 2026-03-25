/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import type Stripe from 'stripe';

import { StripeSDKMock } from 'src/engine/core-modules/billing/stripe/stripe-sdk/mocks/stripe-sdk.mock';
import { type StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';

@Injectable()
export class StripeSDKMockService implements StripeSDKService {
  getStripe(stripeApiKey: string) {
    return new StripeSDKMock(stripeApiKey) as unknown as Stripe;
  }
}
