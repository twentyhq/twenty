import { type SpeedLimitDefault } from 'src/engine/core-modules/usage-limit/types/speed-limit-default.type';

export type ResolvedSpeedLimitDefault = Pick<
  SpeedLimitDefault,
  'spenderType' | 'counterScope' | 'isOverridable'
> & {
  maxTokens: number;
  windowMs: number;
};
