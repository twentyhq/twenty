import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export const parseQueueListFromEnv = (value: string | undefined): string[] =>
  value
    ?.split(',')
    .map((queueName) => queueName.trim())
    .filter((queueName) => queueName.length > 0) ?? [];

export const shouldCreateWorkerForQueue = ({
  queueName,
  enabledQueues,
  excludedQueues,
}: {
  queueName: MessageQueue;
  enabledQueues: string[];
  excludedQueues: string[];
}): boolean => {
  if (enabledQueues.length > 0 && !enabledQueues.includes(queueName)) {
    return false;
  }

  return !excludedQueues.includes(queueName);
};
