import { isNonEmptyString } from '@sniptt/guards';

import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const ABSENT = '-';

export const buildStockCounterKey = ({
  workspaceId,
  resourceType,
  spenderType,
  spenderId,
  meter,
}: {
  workspaceId: string;
  resourceType: UsageResourceType;
  spenderType: SpenderType;
  spenderId?: string | null;
  meter: StockMeter;
}): string =>
  `{${workspaceId}}:stock:${resourceType}:${spenderType}:${isNonEmptyString(spenderId) ? spenderId : ABSENT}:${meter}`;
