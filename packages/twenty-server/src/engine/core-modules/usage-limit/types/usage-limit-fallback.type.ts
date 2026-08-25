import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export type UsageLimitFallback = {
  spenderType: SpenderType;
  counterScope: 'perWorkspace' | 'crossWorkspace';
  maxTokensConfigVariable: keyof ConfigVariables;
  windowMsConfigVariable: keyof ConfigVariables;
};
