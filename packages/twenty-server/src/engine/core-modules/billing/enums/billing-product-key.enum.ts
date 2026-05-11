/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingProductKey {
  BASE_PRODUCT = 'BASE_PRODUCT',
  RESOURCE_CREDIT = 'RESOURCE_CREDIT',
  // @deprecated — replaced by RESOURCE_CREDIT, kept while IS_BILLING_V2_ENABLED is not universal
  WORKFLOW_NODE_EXECUTION = 'WORKFLOW_NODE_EXECUTION',
}

registerEnumType(BillingProductKey, {
  name: 'BillingProductKey',
  description: 'The different billing products available',
});
