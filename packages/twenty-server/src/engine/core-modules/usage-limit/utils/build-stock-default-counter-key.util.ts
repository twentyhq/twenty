import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { buildStockCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter-key.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export const buildStockDefaultCounterKey = ({
  workspaceId,
  resourceType,
  operationType,
  spenderType,
  unit,
  limitValue,
}: {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: SpenderType;
  unit: UsageUnit;
  limitValue: number;
}): string =>
  `${buildStockCounterKey({ workspaceId, resourceType, operationType, spenderType, unit, limitValue })}:default`;
