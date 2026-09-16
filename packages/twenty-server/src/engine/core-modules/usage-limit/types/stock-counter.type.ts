import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';

export type StockCounter = {
  key: string;
  limitId: string;
  limitValue: number;
  meter: StockMeter;
  resourceType: StockResourceType;
  spenderType: SpenderType;
  spenderId: string | null;
};
