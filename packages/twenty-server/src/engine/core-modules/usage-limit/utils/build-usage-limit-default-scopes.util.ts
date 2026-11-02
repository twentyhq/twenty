import { isDefined } from 'twenty-shared/utils';

import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { type UsageLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/usage-limit-default-definition.type';
import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { findSingleOperationType } from 'src/engine/core-modules/usage-limit/utils/find-single-operation-type.util';
import { findUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-defaults.util';
import { getUsageLimitDefaultOperationTypes } from 'src/engine/core-modules/usage-limit/utils/get-usage-limit-default-operation-types.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type UsageLimitDefaultScope = UsageLimitScope & {
  isOverridable: boolean;
  limitValue: number;
};

type GetConfigValue = <TKey extends OptionalNumericConfigVariableKey>(
  key: TKey,
) => ConfigVariables[TKey];

const buildPeriodCount = ({
  usageLimitDefault,
  getConfigValue,
}: {
  usageLimitDefault: UsageLimitDefaultDefinition;
  getConfigValue: GetConfigValue;
}): number =>
  usageLimitDefault.limitKind === 'speed'
    ? Math.ceil(getConfigValue(usageLimitDefault.windowMsConfigVariable) / 1000)
    : usageLimitDefault.periodCount;

export const buildUsageLimitDefaultScopes = ({
  getConfigValue,
}: {
  getConfigValue: GetConfigValue;
}): UsageLimitDefaultScope[] =>
  Object.values(UsageResourceType).flatMap((resourceType) =>
    findUsageLimitDefaults({ resourceType }).flatMap((usageLimitDefault) => {
      const limitValue = getConfigValue(
        usageLimitDefault.limitValueConfigVariable,
      );
      const operationType = findSingleOperationType(
        getUsageLimitDefaultOperationTypes(usageLimitDefault),
      );

      return isDefined(limitValue) && isDefined(operationType)
        ? [
            {
              resourceType: usageLimitDefault.resourceType,
              operationType,
              spenderType: usageLimitDefault.spenderType,
              spenderId: usageLimitDefault.spenderId,
              limitKind: usageLimitDefault.limitKind,
              unit: usageLimitDefault.unit,
              periodUnit: usageLimitDefault.periodUnit,
              periodCount: buildPeriodCount({
                usageLimitDefault,
                getConfigValue,
              }),
              limitValue,
              isOverridable: usageLimitDefault.isOverridable,
            },
          ]
        : [];
    }),
  );
