import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export const JOB_SIZE_LIMITED_QUEUES: ReadonlySet<MessageQueue> = new Set([
  MessageQueue.logicFunctionQueue,
  MessageQueue.workflowQueue,
]);
