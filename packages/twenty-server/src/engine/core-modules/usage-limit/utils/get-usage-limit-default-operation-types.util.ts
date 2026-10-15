import { assertUnreachable } from 'twenty-shared/utils';

import { type UsageLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/usage-limit-default-definition.type';
import { type QuotaOperationTypes } from 'src/engine/core-modules/usage-limit/types/quota-operation-types.type';

export const getUsageLimitDefaultOperationTypes = (
  usageLimitDefault: UsageLimitDefaultDefinition,
): QuotaOperationTypes => {
  switch (usageLimitDefault.limitKind) {
    case 'quota':
      return usageLimitDefault.operationTypes;
    case 'speed':
    case 'stock':
      return [usageLimitDefault.operationType];
    default:
      return assertUnreachable(usageLimitDefault);
  }
};
