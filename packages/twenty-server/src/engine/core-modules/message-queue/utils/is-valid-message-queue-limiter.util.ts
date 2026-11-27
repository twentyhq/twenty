import { type MessageQueueLimiter } from 'src/engine/core-modules/message-queue/types/message-queue-limiter.type';

export const isValidMessageQueueLimiter = ({
  max,
  durationMs,
}: MessageQueueLimiter): boolean =>
  Number.isInteger(max) &&
  max > 0 &&
  Number.isFinite(durationMs) &&
  durationMs > 0;
