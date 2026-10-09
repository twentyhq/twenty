import {
  type UsageOperationType,
  type UsageResourceType,
  type UsageUnit,
} from '~/generated-admin/graphql';

export type AdminUsageLimitRow = {
  id: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: string;
  limitKind: string;
  periodCount: number;
  periodUnit: string;
  unit: UsageUnit;
  defaultValue: number;
  limitValue: number;
  burstValue: number | null;
  usageLimitId: string | null;
  isOverridden: boolean;
};
