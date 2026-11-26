import { registerEnumType } from '@nestjs/graphql';

import { type ApplicationBillingPrice } from 'twenty-shared/application';

export const ApplicationBillingPriceUnitEnum = {
  WORKSPACE_MEMBER: 'WORKSPACE_MEMBER',
  CONNECTED_ACCOUNT: 'CONNECTED_ACCOUNT',
} as const satisfies { [P in NonNullable<ApplicationBillingPrice['per']>]: P };

registerEnumType(ApplicationBillingPriceUnitEnum, {
  name: 'ApplicationBillingPriceUnit',
});
