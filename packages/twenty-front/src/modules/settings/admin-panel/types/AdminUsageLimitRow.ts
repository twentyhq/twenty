import {
  type UsageOperationType,
  type UsageResourceType,
} from '~/generated-admin/graphql';

// One overridable instance default, carrying the workspace's override when it
// has one. Defaults nothing can replace, and limits a workspace set for itself,
// are not part of this table.
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
  isEnforcedOnCurrentPlan: boolean;
  limitValueConfigVariable: string;
  // How many overridable defaults share this one's scope. Above one, a single
  // override replaces all of them, because the speed rule ignores the period.
  suppressedTogetherCount: number;
};
