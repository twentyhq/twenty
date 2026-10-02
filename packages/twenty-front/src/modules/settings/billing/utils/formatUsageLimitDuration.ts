import { t } from '@lingui/core/macro';

const MILLISECONDS_PER_SECOND = 1_000;
const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_HOUR = 3_600_000;

export const formatUsageLimitDuration = (
  milliseconds: number,
  formatAmount: (amount: number) => string,
): string => {
  if (milliseconds < MILLISECONDS_PER_SECOND) {
    const amount = formatAmount(milliseconds);

    return t`${amount} ms`;
  }

  if (milliseconds < MILLISECONDS_PER_MINUTE) {
    const amount = formatAmount(milliseconds / MILLISECONDS_PER_SECOND);

    return t`${amount} s`;
  }

  if (milliseconds < MILLISECONDS_PER_HOUR) {
    const amount = formatAmount(milliseconds / MILLISECONDS_PER_MINUTE);

    return t`${amount} min`;
  }

  const amount = formatAmount(milliseconds / MILLISECONDS_PER_HOUR);

  return t`${amount} h`;
};
