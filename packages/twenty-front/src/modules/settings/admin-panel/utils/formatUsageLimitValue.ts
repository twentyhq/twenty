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
    return `${(value / INTERNAL_CREDITS_PER_DISPLAY_CREDIT).toLocaleString()} credits`;
  }

  return value.toLocaleString();
};
