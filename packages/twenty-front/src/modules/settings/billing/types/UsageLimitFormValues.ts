import { type UsageLimitMeter } from '@/settings/billing/types/UsageLimitMeter';
import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';
import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';
import {
  type UsageOperationType,
  type UsageResourceType,
} from '~/generated-metadata/graphql';

export type UsageLimitFormValues = {
  resourceType: UsageResourceType | null;
  operationType: UsageOperationType | null;
  spenderType: UsageLimitSpenderType | null;
  spenderId: string;
  meter: UsageLimitMeter | null;
  periodUnit: UsageLimitPeriodUnit | null;
  limitValue: string;
};
