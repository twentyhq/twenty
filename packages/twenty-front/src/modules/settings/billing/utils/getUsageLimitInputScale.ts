import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';

import { UsageUnit } from '~/generated-metadata/graphql';

export const getUsageLimitInputScale = (unit: UsageUnit | null): number =>
  unit === UsageUnit.CREDIT ? INTERNAL_CREDITS_PER_DISPLAY_CREDIT : 1;
