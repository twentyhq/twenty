import { isDefined } from 'twenty-shared/utils';

import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';

export const getLimitValueConfigVariable = ({
  limitValueConfigVariable,
  trialLimitValueConfigVariable,
  isInTrialPeriod,
}: {
  limitValueConfigVariable: NumericConfigVariableKey;
  trialLimitValueConfigVariable?: NumericConfigVariableKey;
  isInTrialPeriod: boolean;
}): NumericConfigVariableKey =>
  isInTrialPeriod && isDefined(trialLimitValueConfigVariable)
    ? trialLimitValueConfigVariable
    : limitValueConfigVariable;
