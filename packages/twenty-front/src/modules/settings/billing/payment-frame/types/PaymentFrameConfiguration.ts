import { type StripeElementsOptionsMode } from '@stripe/stripe-js';

export type PaymentFrameConfiguration = {
  publishableKey: string;
  elementsOptions: StripeElementsOptionsMode;
  colorScheme: 'light' | 'dark';
};
