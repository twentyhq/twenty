import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export type ExhaustedScope = {
  resourceType: UsageResourceType;
  // Null when the exhausted rule covers every operation of the resource.
  operationType: UsageOperationType | null;
  limitKind: LimitKind;
  spenderType: SpenderType;
  spenderId: string | null;
  limitValue: number;
  remaining: number;
  windowSeconds: number;
  retryAfterMs: number;
  // Quota only: when the period resets. Speed scopes carry retryAfterMs.
  periodEnd: Date | null;
  isFallback: boolean;
};
