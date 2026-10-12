import { type StockScope } from 'src/engine/core-modules/usage-limit/types/stock-scope.type';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export type ComputeUsedStock = (
  scope: StockScope,
) => Promise<Partial<Record<UsageUnit, number>>>;
