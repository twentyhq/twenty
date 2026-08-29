import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export type ExhaustedScope = {
  resourceType: UsageResourceType;
  limitKind: LimitKind;
  spenderType: SpenderType;
  spenderId: string | null;
  limitValue: number;
  remaining: number;
  windowSeconds: number;
  retryAfterMs: number;
  isFallback: boolean;
};
