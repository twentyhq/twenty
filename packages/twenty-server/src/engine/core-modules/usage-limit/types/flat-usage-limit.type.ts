import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type LimitValueType } from 'src/engine/core-modules/usage-limit/types/limit-value-type.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export type FlatUsageLimit = {
  id: string;
  resourceType: UsageResourceType;
  // '' targets every operation of the resource, mirroring the spenderId
  // convention; a nullable column would defeat UQ_USAGE_LIMIT_SCOPE since
  // Postgres treats NULLs as distinct.
  operationType: UsageOperationType | '';
  spenderType: SpenderType;
  spenderId: string;
  limitKind: LimitKind;
  windowSeconds: number;
  limitValueType: LimitValueType;
  limitValue: number;
  burstValue: number | null;
};
