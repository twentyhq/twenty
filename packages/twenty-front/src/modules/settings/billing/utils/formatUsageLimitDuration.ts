import { t } from '@lingui/core/macro';

const MILLISECONDS_PER_SECOND = 1_000;
const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_HOUR = 3_600_000;

const roundToOneDecimal = (value: number): number => Number(value.toFixed(1));

export const formatUsageLimitDuration = (milliseconds: number): string => {
  if (milliseconds < MILLISECONDS_PER_SECOND) {
    const amount = roundToOneDecimal(milliseconds);

    return t`${amount} ms`;
  }

  if (milliseconds < MILLISECONDS_PER_MINUTE) {
    const amount = roundToOneDecimal(milliseconds / MILLISECONDS_PER_SECOND);

    return t`${amount} s`;
  }

  if (milliseconds < MILLISECONDS_PER_HOUR) {
    const amount = roundToOneDecimal(milliseconds / MILLISECONDS_PER_MINUTE);

    return t`${amount} min`;
  }

  const amount = roundToOneDecimal(milliseconds / MILLISECONDS_PER_HOUR);

  return t`${amount} h`;
};
