import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type StockLimitDefaultDefinition<
  TResourceType extends UsageResourceType = UsageResourceType,
> = {
  resourceType: TResourceType;
  operationType: UsageOperationType;
  limitKind: 'stock';
  spenderType: SpenderType;
  spenderId: '';
  meter: StockMeter;
  periodUnit: 'lifetime';
  periodCount: 1;
  limitValueConfigVariable: NumericConfigVariableKey;
  isOverridable: boolean;
};
