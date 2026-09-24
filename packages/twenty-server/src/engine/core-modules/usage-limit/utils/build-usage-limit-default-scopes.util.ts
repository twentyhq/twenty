import { isDefined } from 'twenty-shared/utils';

import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type UsageLimitDefault } from 'src/engine/core-modules/usage-limit/types/usage-limit-default.type';
import { buildUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-defaults.util';
import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type UsageLimitDefaultScope = UsageLimitScope &
  Pick<UsageLimitDefault, 'isOverridable' | 'limitValueConfigVariable'> & {
    limitValue: number;
  };

const buildPeriod = ({
  usageLimitDefault,
  getConfigValue,
}: {
  usageLimitDefault: UsageLimitDefault;
  getConfigValue: (key: NumericConfigVariableKey) => number;
}): Pick<UsageLimitScope, 'periodCount' | 'periodUnit'> => {
  if (
    usageLimitDefault.limitKind === 'speed' &&
    isDefined(usageLimitDefault.windowMsConfigVariable)
  ) {
    return {
      // buildDefaultSpeedBucket rounds the same way, so the scope an operator
      // overrides is the one the bucket is actually keyed on.
      periodCount: Math.ceil(
        getConfigValue(usageLimitDefault.windowMsConfigVariable) / 1000,
      ),
      periodUnit: 'second',
    };
  }

  return { periodCount: 1, periodUnit: 'lifetime' };
};

// Every declared default as the row that would replace it, so overriding one is
// a matter of copying the scope and typing a new value.
export const buildUsageLimitDefaultScopes = ({
  getConfigValue,
}: {
  getConfigValue: (key: NumericConfigVariableKey) => number;
}): UsageLimitDefaultScope[] =>
  Object.values(UsageResourceType).flatMap((resourceType) =>
    buildUsageLimitDefaults({ resourceType }).map((usageLimitDefault) => ({
      resourceType: usageLimitDefault.resourceType,
      operationType: usageLimitDefault.operationType,
      spenderType: usageLimitDefault.spenderType,
      spenderId: '',
      limitKind: usageLimitDefault.limitKind,
      meter: usageLimitDefault.meter,
      ...buildPeriod({ usageLimitDefault, getConfigValue }),
      limitValue: getConfigValue(usageLimitDefault.limitValueConfigVariable),
      isOverridable: usageLimitDefault.isOverridable,
      limitValueConfigVariable: usageLimitDefault.limitValueConfigVariable,
    })),
  );
