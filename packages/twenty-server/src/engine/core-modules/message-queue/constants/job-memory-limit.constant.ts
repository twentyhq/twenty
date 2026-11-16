import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export const JOB_MEMORY_INFO_CACHE_MS = 1_000;

export const JOB_MEMORY_RECONCILE_BATCH_SIZE = 200;

export const JOB_MEMORY_RECONCILE_SUSPECTS_TTL_SECONDS = 60 * 60;

export const JOB_MEMORY_TOP_GROUP_KEYS_REPORTED = 20;

export const JOB_MEMORY_TOP_GROUP_KEYS_CACHE_MS = 60_000;

export const NOT_CHARGED_QUEUES: MessageQueue[] = [
  MessageQueue.accessGroupQueue,
  MessageQueue.billingQueue,
  MessageQueue.deleteCascadeQueue,
  MessageQueue.workspaceDestroyQueue,
];
