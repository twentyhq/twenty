import { plural, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { formatNumber } from '@/localization/utils/formatNumber';

export const getAiChatUsageLabel = ({
  loading,
  hasError,
  hasUsage,
  daysUntilReset,
  creditPercentage,
  unavailableConsumptionLabel = '—',
}: {
  loading: boolean;
  hasError: boolean;
  hasUsage: boolean;
  daysUntilReset: number | null;
  creditPercentage: number | null;
  unavailableConsumptionLabel?: string;
}): string => {
  if (loading) {
    return t`Loading…`;
  }

  if (hasError) {
    return t`Not available`;
  }

  if (!hasUsage) {
    return t`No limit`;
  }

  if (!isDefined(creditPercentage)) {
    return unavailableConsumptionLabel;
  }

  const percentage = formatNumber(creditPercentage, { decimals: 1 });

  if (!isDefined(daysUntilReset)) {
    return `${percentage}%`;
  }

  return t`Reset in ${plural(daysUntilReset, { one: '# day', other: '# days' })} (${percentage}%)`;
};
