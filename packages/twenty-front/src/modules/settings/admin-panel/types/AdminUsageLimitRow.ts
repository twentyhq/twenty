import {
  type UsageOperationType,
  type UsageResourceType,
} from '~/generated-admin/graphql';

export type AdminUsageLimitRow = {
  id: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: string;
  limitKind: string;
  periodCount: number;
  periodUnit: string;
  meter: string;
  defaultValue: number;
  limitValue: number;
  burstValue: number | null;
  usageLimitId: string | null;
  isOverridden: boolean;
};
