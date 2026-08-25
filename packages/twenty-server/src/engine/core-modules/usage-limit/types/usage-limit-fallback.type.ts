import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export type UsageLimitFallback = {
  spenderType: SpenderType;
  counterScope: 'perWorkspace' | 'crossWorkspace';
  maxTokensConfigVariable: NumericConfigVariableKey;
  windowMsConfigVariable: NumericConfigVariableKey;
};
