import { t } from '@lingui/core/macro';
import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { formatBytes } from 'twenty-shared/utils';

export const formatUsageLimitValue = ({
  value,
  meter,
}: {
  value: number;
  meter: string;
}): string => {
  if (meter === 'bytes') {
    return formatBytes(value);
  }

  if (meter === 'creditsUsedMicro') {
    const credits = (
      value / INTERNAL_CREDITS_PER_DISPLAY_CREDIT
    ).toLocaleString();

    return t`${credits} credits`;
  }

  return value.toLocaleString();
};
