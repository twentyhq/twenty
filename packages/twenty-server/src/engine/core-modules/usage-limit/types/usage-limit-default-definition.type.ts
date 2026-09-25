import { type SpeedLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/speed-limit-default-definition.type';
import { type StockLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/stock-limit-default-definition.type';

export type UsageLimitDefaultDefinition =
  | SpeedLimitDefaultDefinition
  | StockLimitDefaultDefinition;
