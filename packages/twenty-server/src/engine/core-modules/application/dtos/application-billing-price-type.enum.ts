import { registerEnumType } from '@nestjs/graphql';

import { type ApplicationBillingPrice } from 'twenty-shared/application';

export const ApplicationBillingPriceTypeEnum = {
  RECURRING: 'RECURRING',
} as const satisfies { [P in ApplicationBillingPrice['type']]: P };

registerEnumType(ApplicationBillingPriceTypeEnum, {
  name: 'ApplicationBillingPriceType',
});
