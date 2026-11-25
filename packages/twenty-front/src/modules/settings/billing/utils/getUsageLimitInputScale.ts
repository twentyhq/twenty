import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';

import { isCreditUsageUnit } from '@/settings/billing/utils/isCreditUsageUnit';
import { type UsageUnit } from '~/generated-metadata/graphql';

export const getUsageLimitInputScale = (unit: UsageUnit | null): number =>
  isCreditUsageUnit(unit) ? INTERNAL_CREDITS_PER_DISPLAY_CREDIT : 1;
