import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';

export const EMPTY_USAGE_LIMIT_FORM_VALUES: UsageLimitFormValues = {
  resourceType: null,
  operationType: null,
  spenderType: 'workspace',
  spenderId: '',
  meter: null,
  periodUnit: null,
  limitValue: '',
};
