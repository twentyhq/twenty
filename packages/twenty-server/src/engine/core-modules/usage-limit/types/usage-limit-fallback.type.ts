import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type CounterScope } from 'src/engine/core-modules/usage-limit/types/counter-scope.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

// A fallback either reads its limit from config variables (speed) or derives
// it from the workspace's billing allowance (quota).
export type UsageLimitFallback =
  | {
      source: 'configVariable';
      spenderType: SpenderType;
      counterScope: CounterScope;
      isOverridable: boolean;
      limitValueConfigVariable: NumericConfigVariableKey;
      windowMsConfigVariable: NumericConfigVariableKey;
    }
  | {
      source: 'allowance';
      spenderType: SpenderType;
    };
