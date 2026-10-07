import { isNull } from '@sniptt/guards';

import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { findAllPlanLimitDefaultValues } from 'src/engine/core-modules/usage-limit/utils/find-all-plan-limit-default-values.util';

export const findCandidateLimitDefaultValues = ({
  limitValueConfigVariable,
  plans,
  instanceValue,
}: {
  limitValueConfigVariable: NumericConfigVariableKey;
  plans: Record<string, unknown>;
  instanceValue: number;
}): number[] => [
  ...new Set([
    instanceValue,
    ...findAllPlanLimitDefaultValues(plans).flatMap(
      ({ configVariable, limitValue }) =>
        configVariable === limitValueConfigVariable && !isNull(limitValue)
          ? [limitValue]
          : [],
    ),
  ]),
];
