import { assertUnreachable } from 'twenty-shared/utils';

import { type UsageLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/usage-limit-default-definition.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const getUsageLimitDefaultOperationTypes = (
  usageLimitDefault: UsageLimitDefaultDefinition,
): UsageOperationType[] => {
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
