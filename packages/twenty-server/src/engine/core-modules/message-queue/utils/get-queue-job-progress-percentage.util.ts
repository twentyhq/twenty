import { isNumber } from '@sniptt/guards';

export const getQueueJobProgressPercentage = (
  progress: unknown,
): number | undefined =>
  isNumber(progress) && Number.isFinite(progress)
    ? Math.min(100, Math.max(0, Math.round(progress)))
    : undefined;
