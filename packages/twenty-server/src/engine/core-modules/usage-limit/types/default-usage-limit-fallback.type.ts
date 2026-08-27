import { type CounterScope } from 'src/engine/core-modules/usage-limit/types/counter-scope.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

// A configVariable fallback with its config variables already resolved.
export type DefaultUsageLimitFallback = {
  spenderType: SpenderType;
  counterScope: CounterScope;
  isOverridable: boolean;
  maxTokens: number;
  windowMs: number;
};
