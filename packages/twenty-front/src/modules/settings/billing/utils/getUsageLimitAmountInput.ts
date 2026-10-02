import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitAmountInput } from '@/settings/billing/types/UsageLimitAmountInput';
import { getUsageLimitUnitLabel } from '@/settings/billing/utils/getUsageLimitUnitLabel';
import { UsageOperationType, UsageUnit } from '~/generated-metadata/graphql';

export const getUsageLimitAmountInput = ({
  unit,
  operationType,
}: {
  unit: UsageUnit | null;
  operationType: UsageOperationType | null;
}): UsageLimitAmountInput => {
  if (!isDefined(unit)) {
    return { label: msg`Amount`, placeholder: '1000', helpText: null };
  }

  if (unit === UsageUnit.MILLISECOND) {
    return {
      label: msg`Minutes`,
      placeholder: '60',
      helpText: msg`Runtime is checked when a run starts and counted when it ends, so a run in progress can go past the limit.`,
    };
  }

  const label = getUsageLimitUnitLabel({ unit, operationType }).name;

  if (unit === UsageUnit.CREDIT) {
    return { label, placeholder: '100', helpText: null };
  }

  if (
    unit === UsageUnit.INVOCATION &&
    operationType === UsageOperationType.CODE_EXECUTION
  ) {
    return {
      label,
      placeholder: '1000',
      helpText: msg`Runs of free apps count toward this limit but are never refused. Apply it to an app or a function to leave them out.`,
    };
  }

  return { label, placeholder: '1000', helpText: null };
};
