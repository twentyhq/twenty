import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';

export type StockLimitDefaultDefinition = {
  spenderType: SpenderType;
  meter: StockMeter;
  isOverridable: boolean;
  limitValueConfigVariable: NumericConfigVariableKey;
};
