import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

// Single source of truth to pilot worker behavior per queue. Every value is
// explicit on purpose (Record + Required): adding a queue without declaring
// its full configuration is a compile error, and no queue silently relies on
// implicit BullMQ defaults.
//
// priority: applied when enqueuing, lower value is processed first
// concurrency: max jobs processed in parallel per worker process
// lockDuration: ms a job may run before BullMQ considers it stalled
// maxStalledCount: times a stalled job is re-queued before failing permanently
// boundedShutdownDrain: on shutdown, abort still-active jobs after
//   AI_STREAM_SHUTDOWN_DRAIN_MS instead of waiting for them to finish

export type MessageQueueWorkerConfig = {
  priority: number;
  workerOptions: Required<MessageQueueWorkerOptions>;
};

export const MESSAGE_QUEUE_WORKER_CONFIG: Record<
  MessageQueue,
  MessageQueueWorkerConfig
> = {
  [MessageQueue.taskAssignedQueue]: {
    priority: 4,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.messagingQueue]: {
    priority: 2,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.webhookQueue]: {
    priority: 2,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.cronQueue]: {
    priority: 7,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.emailQueue]: {
    priority: 1,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.calendarQueue]: {
    priority: 4,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.contactCreationQueue]: {
    priority: 4,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.billingQueue]: {
    priority: 1,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.workspaceQueue]: {
    priority: 5,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.entityEventsToDbQueue]: {
    priority: 1,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.workflowQueue]: {
    priority: 2,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.delayedJobsQueue]: {
    priority: 3,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.deleteCascadeQueue]: {
    priority: 6,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.logicFunctionQueue]: {
    priority: 4,
    workerOptions: {
      concurrency: 10,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.triggerQueue]: {
    priority: 5,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.aiQueue]: {
    priority: 5,
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.aiStreamQueue]: {
    priority: 2,
    workerOptions: {
      concurrency: 20,
      // 10 minutes: a stream job holds its lock for the whole stream duration
      lockDuration: 600_000,
      // A stalled stream cannot be resumed client-side, never re-queue it
      maxStalledCount: 0,
      boundedShutdownDrain: true,
    },
  },
};
