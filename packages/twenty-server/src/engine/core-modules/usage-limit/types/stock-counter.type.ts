import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';

export type StockCounter = {
  key: string;
  isDefault: boolean;
  limitValue: number;
  unit: UsageUnit;
  resourceType: StockResourceType;
  operationType: UsageOperationType;
  spenderType: SpenderType;
  spenderId: string | null;
};
