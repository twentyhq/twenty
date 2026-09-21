import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export type ExhaustedScope = {
  resourceType: UsageResourceType;
  limitKind: LimitKind;
  exhaustedKind: ExhaustedKind;
  spenderType: SpenderType;
  spenderId: string | null;
  operationType: UsageOperationType;
  limitValue: number;
  // Speed limits only. What admission is actually tested against: a bucket
  // never holds more than its burst, so a cost above it can never be admitted
  // however long the caller waits, while limitValue only says how fast it
  // refills.
  burstValue?: number;
  remaining: number;
  periodCount: number | null;
  periodUnit: PeriodUnit | null;
  retryAfterMs: number;
  isDefault?: boolean;
};
