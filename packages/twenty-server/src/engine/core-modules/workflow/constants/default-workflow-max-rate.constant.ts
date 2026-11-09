import { type MessageQueueMaxRate } from 'src/engine/core-modules/message-queue/types/message-queue-max-rate.type';

export const DEFAULT_WORKFLOW_MAX_RATE: MessageQueueMaxRate = {
  max: 100,
  durationMs: 60_000,
};
