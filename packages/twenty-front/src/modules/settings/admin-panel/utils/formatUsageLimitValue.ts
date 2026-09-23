import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

const formatBytes = (value: number): string => {
  const unitIndex = Math.min(
    BYTE_UNITS.length - 1,
    value > 0 ? Math.floor(Math.log(value) / Math.log(1024)) : 0,
  );
  const scaled = value / 1024 ** unitIndex;

  return `${Number(scaled.toFixed(unitIndex === 0 ? 0 : 1))} ${BYTE_UNITS[unitIndex]}`;
};

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
