import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

/**
 * Per-queue concurrency overrides. Queues not listed here default to 1
 * (BullMQ's default). Increase only for queues whose jobs are I/O-bound
 * or where backlog buildup has been observed.
 */
export const MESSAGE_QUEUE_CONCURRENCY: Partial<Record<MessageQueue, number>> =
  {
    [MessageQueue.logicFunctionQueue]: 3,
    [MessageQueue.webhookQueue]: 3,
    [MessageQueue.ingestionQueue]: 3,
    [MessageQueue.importQueue]: 2,
    [MessageQueue.exportQueue]: 2,
  };
