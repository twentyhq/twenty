import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageLimitFallback } from 'src/engine/core-modules/usage-limit/types/usage-limit-fallback.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export type UsageLimitDefinition = {
  allowedOperationTypes: UsageOperationType[];
  allowedSpenderTypes: SpenderType[];
  fallbacks: UsageLimitFallback[];
};
