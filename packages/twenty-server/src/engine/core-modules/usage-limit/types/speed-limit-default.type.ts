import { type SpeedLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/speed-limit-default-definition.type';

export type SpeedLimitDefault = Pick<
  SpeedLimitDefaultDefinition,
  'spenderType' | 'counterScope' | 'isOverridable'
> & {
  maxTokens: number;
  windowMs: number;
};
