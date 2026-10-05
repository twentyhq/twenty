import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';
import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';
import {
  type UsageOperationType,
  type UsageResourceType,
  type UsageUnit,
} from '~/generated-metadata/graphql';

export type UsageLimitFormValues = {
  resourceType: UsageResourceType | null;
  operationType: UsageOperationType | null;
  spenderType: UsageLimitSpenderType | null;
  spenderId: string;
  unit: UsageUnit | null;
  periodUnit: UsageLimitPeriodUnit | null;
  limitValue: string;
};
