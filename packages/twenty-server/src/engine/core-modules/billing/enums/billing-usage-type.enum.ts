/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingUsageType {
  METERED = 'METERED',
  LICENSED = 'LICENSED',
}

registerEnumType(BillingUsageType, {
  name: 'BillingUsageType',
  description: 'The different billing usage types',
});
