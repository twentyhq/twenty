import { registerEnumType } from '@nestjs/graphql';

import { type ApplicationBillingPrice } from 'twenty-shared/application';

export const ApplicationBillingPricePeriodEnum = {
  MONTHLY: 'MONTHLY',
} as const satisfies { [P in ApplicationBillingPrice['billingPeriod']]: P };

registerEnumType(ApplicationBillingPricePeriodEnum, {
  name: 'ApplicationBillingPricePeriod',
});
