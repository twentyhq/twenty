import { registerEnumType } from '@nestjs/graphql';

import { type ApplicationBillingPrice } from 'twenty-shared/application';

export const ApplicationBillingPriceCurrencyEnum = {
  USD: 'USD',
} as const satisfies {
  [P in NonNullable<ApplicationBillingPrice['currency']>]: P;
};

registerEnumType(ApplicationBillingPriceCurrencyEnum, {
  name: 'ApplicationBillingPriceCurrency',
});
