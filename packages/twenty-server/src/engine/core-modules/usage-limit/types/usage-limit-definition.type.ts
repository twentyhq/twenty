import { type QuotaMeter } from 'src/engine/core-modules/usage-limit/types/quota-meter.type';
import { type SpeedLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/speed-limit-default-definition.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type StockLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/stock-limit-default-definition.type';
import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

type SpeedLimitDefinition = {
  allowedOperationTypes: UsageOperationType[];
  allowedSpenderTypes: SpenderType[];
  defaults: SpeedLimitDefaultDefinition[];
};

type QuotaLimitDefinition = {
  allowedOperationTypes: UsageOperationType[];
  allowedSpenderTypes: SpenderType[];
  allowedMeters: QuotaMeter[];
};

type StockLimitDefinition = {
  allowedOperationTypes: UsageOperationType[];
  allowedSpenderTypes: SpenderType[];
  allowedMeters: StockMeter[];
  defaults: StockLimitDefaultDefinition[];
};

export type UsageLimitDefinitions = {
  speed?: SpeedLimitDefinition;
  quota?: QuotaLimitDefinition;
  stock?: StockLimitDefinition;
};
