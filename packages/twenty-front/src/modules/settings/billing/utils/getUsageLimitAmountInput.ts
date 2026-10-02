import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitAmountInput } from '@/settings/billing/types/UsageLimitAmountInput';
import { getUsageLimitUnitLabel } from '@/settings/billing/utils/getUsageLimitUnitLabel';
import {
  type UsageOperationType,
  UsageUnit,
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

  if (unit === UsageUnit.MILLISECOND) {
    return { label: msg`Minutes`, placeholder: '60' };
  }

  return {
    label: getUsageLimitUnitLabel({ unit, operationType }).name,
    placeholder: unit === UsageUnit.CREDIT ? '100' : '1000',
  };
};
