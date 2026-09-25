import type Stripe from 'stripe';

// The billing queue runs one job at a time, so a slow Stripe call must not
// hold back seat updates for minutes. Job retries handle transient failures.
export const PAYMENT_METHOD_DOMAIN_STRIPE_REQUEST_OPTIONS: Stripe.RequestOptions =
  { timeout: 10_000, maxNetworkRetries: 0 };
