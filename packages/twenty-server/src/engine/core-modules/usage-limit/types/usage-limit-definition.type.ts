import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageLimitFallback } from 'src/engine/core-modules/usage-limit/types/usage-limit-fallback.type';

export type UsageLimitDefinition = {
  allowedSpenderTypes: SpenderType[];
  fallbacks: UsageLimitFallback[];
};
