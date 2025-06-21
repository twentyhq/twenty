/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingProductKey {
  BASE_PRODUCT = 'BASE_PRODUCT',
  WORKFLOW_NODE_EXECUTION = 'WORKFLOW_NODE_EXECUTION',
}

registerEnumType(BillingProductKey, {
  name: 'BillingProductKey',
  description: 'The different billing products available',
});
