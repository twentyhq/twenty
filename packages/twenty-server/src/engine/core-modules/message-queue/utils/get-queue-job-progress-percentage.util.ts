import { isNumber } from '@sniptt/guards';

// BullMQ stores whatever a job passes to updateProgress; only a plain number is
// a percentage the client can render
export const getQueueJobProgressPercentage = (
  progress: unknown,
): number | undefined =>
  isNumber(progress) && Number.isFinite(progress)
    ? Math.min(100, Math.max(0, Math.round(progress)))
    : undefined;
