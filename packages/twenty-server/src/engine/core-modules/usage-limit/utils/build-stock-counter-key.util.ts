import { isNonEmptyString } from '@sniptt/guards';

import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const ABSENT = '-';

// The counter holds `limitValue - used`, so it only means anything for the value
// it was warmed against. Keying on that value retires the counter as soon as the
// limit changes, instead of leaving a remaining that outlives its limit.
export const buildStockCounterKey = ({
  workspaceId,
  resourceType,
  operationType,
  spenderType,
  spenderId,
  meter,
  limitValue,
}: {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: SpenderType;
  spenderId?: string | null;
  meter: StockMeter;
  limitValue: number;
}): string =>
  `{${workspaceId}}:stock:${resourceType}:${operationType}:${spenderType}:${isNonEmptyString(spenderId) ? spenderId : ABSENT}:${meter}:${limitValue}`;
