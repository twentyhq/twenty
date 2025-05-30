import { registerEnumType } from '@nestjs/graphql';

export enum BillingPaymentProviders {
  Stripe = 'stripe',
  Inter = 'inter',
}

registerEnumType(BillingPaymentProviders, {
  name: 'BillingPaymentProviders',
  description: 'The different billing payment providers available',
});
