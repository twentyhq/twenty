import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { buildStockCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter-key.util';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const buildStockDefaultCounterKey = ({
  workspaceId,
  resourceType,
  spenderType,
  meter,
  limitValue,
}: {
  workspaceId: string;
  resourceType: UsageResourceType;
  spenderType: SpenderType;
  meter: StockMeter;
  limitValue: number;
}): string =>
  `${buildStockCounterKey({ workspaceId, resourceType, spenderType, meter })}:default:${limitValue}`;
