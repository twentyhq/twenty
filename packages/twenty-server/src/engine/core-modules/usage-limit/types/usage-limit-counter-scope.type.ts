import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';

export type UsageLimitCounterScope = Pick<
  UsageLimitEntity,
  | 'workspaceId'
  | 'resourceType'
  | 'operationType'
  | 'spenderType'
  | 'spenderId'
  | 'limitKind'
  | 'periodUnit'
  | 'meter'
>;
