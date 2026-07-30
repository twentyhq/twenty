import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

// Queues whose enqueues are throttled per application by JobEnqueueThrottlerGuard.
export const GUARDED_ENQUEUE_QUEUES: ReadonlySet<MessageQueue> = new Set([
  MessageQueue.logicFunctionQueue,
]);
