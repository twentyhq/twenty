import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';

export type PlanLimitDefaultValuesByConfigVariable = Map<
  NumericConfigVariableKey,
  number | null
>;
