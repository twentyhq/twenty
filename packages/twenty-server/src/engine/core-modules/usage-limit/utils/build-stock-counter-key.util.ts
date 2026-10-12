import { isNonEmptyString } from '@sniptt/guards';

import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';

const ABSENT = '-';

export const buildStockCounterKey = ({
  workspaceId,
  counter,
}: {
  workspaceId: string;
  counter: Pick<
    StockCounter,
    'resourceType' | 'spenderType' | 'spenderId' | 'unit'
  >;
}): string =>
  `{${workspaceId}}:stock-held:${counter.resourceType}:${counter.spenderType}:${isNonEmptyString(counter.spenderId) ? counter.spenderId : ABSENT}:${counter.unit}`;
