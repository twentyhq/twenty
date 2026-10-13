import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';

type PlanUsageLimitDefaultValues = Partial<
  Record<OptionalNumericConfigVariableKey, number | null>
>;

export type PlanUsageLimitDefaults = {
  values?: PlanUsageLimitDefaultValues;
  trialValues?: PlanUsageLimitDefaultValues;
};
