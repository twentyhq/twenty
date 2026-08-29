import { type UsageLimitFallback } from 'src/engine/core-modules/usage-limit/types/usage-limit-fallback.type';

export type DefaultUsageLimitFallback = Pick<
  UsageLimitFallback,
  'spenderType' | 'counterScope' | 'isOverridable'
> & {
  maxTokens: number;
  windowMs: number;
};
