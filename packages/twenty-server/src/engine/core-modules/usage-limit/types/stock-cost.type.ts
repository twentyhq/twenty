import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export type StockCost = Partial<Record<UsageUnit, number>>;
