import { type QuotaLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/quota-limit-default-definition.type';
import { type QuotaMeter } from 'src/engine/core-modules/usage-limit/types/quota-meter.type';
import { type SpeedLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/speed-limit-default-definition.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type StockLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/stock-limit-default-definition.type';
import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

type SpeedLimitDefinition<TResourceType extends UsageResourceType> = {
  allowedOperationTypes: UsageOperationType[];
  allowedSpenderTypes: SpenderType[];
  defaults: SpeedLimitDefaultDefinition<TResourceType>[];
};

type QuotaLimitDefinition<TResourceType extends UsageResourceType> = {
  allowedOperationTypes: UsageOperationType[];
  allowedSpenderTypes: SpenderType[];
  allowedMeters: QuotaMeter[];
  defaults: QuotaLimitDefaultDefinition<TResourceType>[];
};

type StockLimitDefinition<TResourceType extends UsageResourceType> = {
  allowedOperationTypes: UsageOperationType[];
  allowedSpenderTypes: SpenderType[];
  allowedMeters: StockMeter[];
  defaults: StockLimitDefaultDefinition<TResourceType>[];
};

export type UsageLimitDefinitions<
  TResourceType extends UsageResourceType = UsageResourceType,
> = {
  speed?: SpeedLimitDefinition<TResourceType>;
  quota?: QuotaLimitDefinition<TResourceType>;
  stock?: StockLimitDefinition<TResourceType>;
};

export type UsageLimitDefinitionsByResourceType = {
  [TResourceType in UsageResourceType]: UsageLimitDefinitions<TResourceType>;
};
