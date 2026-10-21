import { useLingui } from '@lingui/react/macro';
import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { formatBytes } from 'twenty-shared/utils';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { getUsageLimitUnitLabel } from '@/settings/billing/utils/getUsageLimitUnitLabel';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import {
  type UsageOperationType,
  UsageUnit,
} from '~/generated-metadata/graphql';

export const useUsageLimitFormatter = () => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { formatUsageAmount } = useUsageValueFormatter();

  const formatLimitValue = ({
    value,
    unit,
    operationType,
  }: {
    value: number;
    unit: UsageUnit;
    operationType: UsageOperationType;
  }): string => {
    if (unit === UsageUnit.CREDIT) {
      return formatUsageAmount(value / INTERNAL_CREDITS_PER_DISPLAY_CREDIT, {
        abbreviate: true,
      });
    }

    if (unit === UsageUnit.BYTE) {
      return formatBytes(value);
    }

    const { suffix } = getUsageLimitUnitLabel({ unit, operationType });

    return `${formatNumber(value, { decimals: 1, abbreviate: true })} ${t(suffix)}`;
  };

  return { formatLimitValue };
};
