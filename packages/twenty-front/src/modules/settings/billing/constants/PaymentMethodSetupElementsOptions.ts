import { type StripeElementsOptionsMode } from '@stripe/stripe-js';

export const PAYMENT_METHOD_SETUP_ELEMENTS_OPTIONS: StripeElementsOptionsMode =
  { mode: 'setup', currency: 'usd' };
