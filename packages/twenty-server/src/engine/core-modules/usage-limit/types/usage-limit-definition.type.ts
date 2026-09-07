import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type SpeedLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/speed-limit-default-definition.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export type SpeedLimitDefinition = {
  allowedOperationTypes: UsageOperationType[];
  allowedSpenderTypes: SpenderType[];
  defaults: SpeedLimitDefaultDefinition[];
};

export type QuotaLimitDefinition = {
  allowedOperationTypes: UsageOperationType[];
  allowedSpenderTypes: SpenderType[];
  allowedMeters: UsageMeter[];
};

export type UsageLimitDefinitions = {
  speed?: SpeedLimitDefinition;
  quota?: QuotaLimitDefinition;
};
