import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type UsageLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/usage-limit-default-definition.type';
import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { findUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-defaults.util';
import { getLimitValueConfigVariable } from 'src/engine/core-modules/usage-limit/utils/get-limit-value-config-variable.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type UsageLimitDefaultScope = UsageLimitScope & {
  isOverridable: boolean;
  limitValue: number;
  isTrialLimitValue: boolean;
};

const buildPeriodCount = ({
  usageLimitDefault,
  getConfigValue,
}: {
  usageLimitDefault: UsageLimitDefaultDefinition;
  getConfigValue: (key: NumericConfigVariableKey) => number;
}): number =>
  usageLimitDefault.limitKind === 'speed'
    ? Math.ceil(getConfigValue(usageLimitDefault.windowMsConfigVariable) / 1000)
    : usageLimitDefault.periodCount;

export const buildUsageLimitDefaultScopes = ({
  getConfigValue,
  isInTrialPeriod,
}: {
  getConfigValue: (key: NumericConfigVariableKey) => number;
  isInTrialPeriod: boolean;
}): UsageLimitDefaultScope[] =>
  Object.values(UsageResourceType).flatMap((resourceType) =>
    findUsageLimitDefaults({ resourceType }).map((usageLimitDefault) => {
      const limitValueConfigVariable = getLimitValueConfigVariable({
        limitValueConfigVariable: usageLimitDefault.limitValueConfigVariable,
        trialLimitValueConfigVariable:
          usageLimitDefault.limitKind === 'quota'
            ? usageLimitDefault.trialLimitValueConfigVariable
            : undefined,
        isInTrialPeriod,
      });

      return {
        resourceType: usageLimitDefault.resourceType,
        operationType: usageLimitDefault.operationType,
        spenderType: usageLimitDefault.spenderType,
        spenderId: usageLimitDefault.spenderId,
        limitKind: usageLimitDefault.limitKind,
        unit: usageLimitDefault.unit,
        periodUnit: usageLimitDefault.periodUnit,
        periodCount: buildPeriodCount({ usageLimitDefault, getConfigValue }),
        limitValue: getConfigValue(limitValueConfigVariable),
        isTrialLimitValue:
          limitValueConfigVariable !==
          usageLimitDefault.limitValueConfigVariable,
        isOverridable: usageLimitDefault.isOverridable,
      };
    }),
  );
