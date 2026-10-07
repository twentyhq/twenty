import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { findUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-defaults.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const isQuotaOrStockDefaultConfigVariable = (
  key: string,
): key is NumericConfigVariableKey =>
  Object.values(UsageResourceType).some((resourceType) =>
    findUsageLimitDefaults({ resourceType }).some(
      (usageLimitDefault) =>
        usageLimitDefault.limitKind !== 'speed' &&
        usageLimitDefault.limitValueConfigVariable === key,
    ),
  );
