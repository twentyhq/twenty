import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type PlanLimitDefaultValuesByConfigVariable } from 'src/engine/core-modules/usage-limit/types/plan-limit-default-values-by-config-variable.type';

export const getLimitDefaultValue = ({
  limitValueConfigVariable,
  planValues,
  getConfigValue,
}: {
  limitValueConfigVariable: NumericConfigVariableKey;
  planValues: PlanLimitDefaultValuesByConfigVariable;
  getConfigValue: (key: NumericConfigVariableKey) => number;
}): number | null =>
  planValues.has(limitValueConfigVariable)
    ? (planValues.get(limitValueConfigVariable) ?? null)
    : getConfigValue(limitValueConfigVariable);
