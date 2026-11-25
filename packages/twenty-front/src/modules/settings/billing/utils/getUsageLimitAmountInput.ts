import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitAmountInput } from '@/settings/billing/types/UsageLimitAmountInput';
import { getUsageLimitUnitLabel } from '@/settings/billing/utils/getUsageLimitUnitLabel';
import { isCreditUsageUnit } from '@/settings/billing/utils/isCreditUsageUnit';
import {
  type UsageOperationType,
  type UsageUnit,
} from '~/generated-metadata/graphql';

export const getUsageLimitAmountInput = ({
  unit,
  operationType,
}: {
  unit: UsageUnit | null;
  operationType: UsageOperationType | null;
}): UsageLimitAmountInput => {
  if (!isDefined(unit)) {
    return { label: msg`Amount`, placeholder: '1000' };
  }

  return {
    label: getUsageLimitUnitLabel({ unit, operationType }).name,
    placeholder: isCreditUsageUnit(unit) ? '100' : '1000',
  };
};
