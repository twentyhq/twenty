import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type QuotaLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/quota-limit-default-definition.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { getLimitValueConfigVariable } from 'src/engine/core-modules/usage-limit/utils/get-limit-value-config-variable.util';

export const buildQuotaLimitDefaults = ({
  quotaLimitDefaultDefinitions,
  getConfigValue,
  isInTrialPeriod,
}: {
  quotaLimitDefaultDefinitions: QuotaLimitDefaultDefinition[];
  getConfigValue: (key: NumericConfigVariableKey) => number;
  isInTrialPeriod: boolean;
}): QuotaLimitDefault[] =>
  quotaLimitDefaultDefinitions.map(
    ({
      limitValueConfigVariable,
      trialLimitValueConfigVariable,
      ...quotaLimitDefault
    }) => ({
      ...quotaLimitDefault,
      limitValue: getConfigValue(
        getLimitValueConfigVariable({
          limitValueConfigVariable,
          trialLimitValueConfigVariable,
          isInTrialPeriod,
        }),
      ),
    }),
  );
