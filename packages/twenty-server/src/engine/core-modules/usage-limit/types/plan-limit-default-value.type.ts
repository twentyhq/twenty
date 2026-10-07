import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';

export type PlanLimitDefaultValue = {
  configVariable: NumericConfigVariableKey;
  limitValue: number | null;
};
