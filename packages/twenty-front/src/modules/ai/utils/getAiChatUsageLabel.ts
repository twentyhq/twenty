import { type I18n } from '@lingui/core';
import { msg, plural } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { formatNumber } from '~/utils/format/formatNumber';

export const getAiChatUsageLabel = ({
  i18n,
  loading,
  hasError,
  hasUsage,
  daysUntilReset,
  creditPercentage,
}: {
  i18n: I18n;
  loading: boolean;
  hasError: boolean;
  hasUsage: boolean;
  daysUntilReset: number | null;
  creditPercentage: number | null;
}) => {
  if (loading) {
    return i18n._(msg`Loading…`);
  }
  if (hasError) {
    return i18n._(msg`Not available`);
  }
  if (!hasUsage) {
    return i18n._(msg`No limit`);
  }
  if (!isDefined(creditPercentage)) {
    return '—';
  }
  if (isDefined(daysUntilReset)) {
    const percentage = formatNumber(creditPercentage, { decimals: 1 });
    return i18n._(
      msg`Reset in ${plural(daysUntilReset, { one: '# day', other: '# days' })} (${percentage}%)`,
    );
  }
  return undefined;
};
