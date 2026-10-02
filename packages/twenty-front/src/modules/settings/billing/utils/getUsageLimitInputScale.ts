import { isDefined } from 'twenty-shared/utils';

import { USAGE_LIMIT_UNIT_INPUT_SCALES } from '@/settings/billing/constants/UsageLimitUnitInputScales';
import { type UsageUnit } from '~/generated-metadata/graphql';

export const getUsageLimitInputScale = (unit: UsageUnit | null): number =>
  (isDefined(unit) ? USAGE_LIMIT_UNIT_INPUT_SCALES[unit] : undefined) ?? 1;
