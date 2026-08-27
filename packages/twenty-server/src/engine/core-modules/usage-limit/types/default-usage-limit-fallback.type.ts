import { type UsageLimitFallback } from 'src/engine/core-modules/usage-limit/types/usage-limit-fallback.type';

export type ResolvedUsageLimitFallback = Pick<
  UsageLimitFallback,
  'spenderType' | 'counterScope'
> & {
  maxTokens: number;
  windowMs: number;
};
