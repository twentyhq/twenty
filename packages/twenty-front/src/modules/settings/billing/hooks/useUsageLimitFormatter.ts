import { useLingui } from '@lingui/react/macro';
import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { USAGE_LIMIT_QUANTITY_UNIT_LABELS } from '@/settings/billing/constants/UsageLimitQuantityUnitLabels';
import { isCreditsMeter } from '@/settings/billing/utils/isCreditsMeter';
import { getUsageLimitLabel } from '@/settings/billing/utils/getUsageLimitLabel';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import { type UsageOperationType } from '~/generated-metadata/graphql';

export const useUsageLimitFormatter = () => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { formatUsageAmount } = useUsageValueFormatter();

  const formatLimitValue = ({
    value,
    meter,
    operationType,
  }: {
    value: number;
    meter: string;
    operationType: UsageOperationType;
  }): string => {
    if (isCreditsMeter(meter)) {
      return formatUsageAmount(value / INTERNAL_CREDITS_PER_DISPLAY_CREDIT, {
        abbreviate: true,
      });
    }

    const unitLabel = getUsageLimitLabel(
      USAGE_LIMIT_QUANTITY_UNIT_LABELS,
      operationType,
    );

    const unit = isDefined(unitLabel) ? t(unitLabel) : t`operations`;

    return `${formatNumber(value, { decimals: 1, abbreviate: true })} ${unit}`;
  };

  return { formatLimitValue };
};
