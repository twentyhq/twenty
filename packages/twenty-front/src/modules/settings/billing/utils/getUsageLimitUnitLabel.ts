import { isDefined } from 'twenty-shared/utils';

import { USAGE_LIMIT_INVOCATION_LABELS } from '@/settings/billing/constants/UsageLimitInvocationLabels';
import { USAGE_LIMIT_UNIT_LABELS } from '@/settings/billing/constants/UsageLimitUnitLabels';
import { type UsageLimitUnitLabel } from '@/settings/billing/types/UsageLimitUnitLabel';
import {
  type UsageOperationType,
  UsageUnit,
} from '~/generated-metadata/graphql';

export const getUsageLimitUnitLabel = ({
  unit,
  operationType,
}: {
  unit: UsageUnit;
  operationType: UsageOperationType | null;
}): UsageLimitUnitLabel => {
  const invocationLabel =
    unit === UsageUnit.INVOCATION && isDefined(operationType)
      ? USAGE_LIMIT_INVOCATION_LABELS[operationType]
      : undefined;

  return invocationLabel ?? USAGE_LIMIT_UNIT_LABELS[unit];
};
