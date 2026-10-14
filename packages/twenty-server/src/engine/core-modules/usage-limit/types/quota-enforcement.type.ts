import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type QuotaEnforcement = {
  operation: 'assert' | 'consume';
  resourceType: UsageResourceType;
  creditsUsedMicro?: number;
};
