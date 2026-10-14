import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type QuotaEnforcement = {
  operation: 'assert' | 'consume';
  resourceType: UsageResourceType;
  counterKind?: UserAllowanceQuotaCounter['kind'];
  creditsUsedMicro?: number;
};
