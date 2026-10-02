import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';

import { UsageUnit } from '~/generated-metadata/graphql';

export const USAGE_LIMIT_UNIT_INPUT_SCALES: Partial<Record<UsageUnit, number>> =
  {
    [UsageUnit.CREDIT]: INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
    [UsageUnit.MILLISECOND]: 60_000,
  };
