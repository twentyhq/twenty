import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type CounterScope } from 'src/engine/core-modules/usage-limit/types/counter-scope.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export type SpeedLimitDefaultDefinition = {
  spenderType: SpenderType;
  counterScope: CounterScope;
  isOverridable: boolean;
  limitValueConfigVariable: NumericConfigVariableKey;
  windowMsConfigVariable: NumericConfigVariableKey;
};
