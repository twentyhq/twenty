import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

// Single source of truth to pilot worker behavior per queue. Every value is
// explicit on purpose (Record + Required): adding a queue without declaring
// its full configuration is a compile error, and no queue silently relies on
// implicit BullMQ defaults.
//
// concurrency: max jobs processed in parallel per worker process
// globalConcurrency: optional, max jobs processed in parallel across all
//   worker processes
// rateLimit: optional, max jobs started per durationMs across all workers
// lockDuration: ms a job may run before BullMQ considers it stalled
// maxStalledCount: times a stalled job is re-queued before failing permanently
// boundedShutdownDrain: on shutdown, abort still-active jobs after
//   AI_STREAM_SHUTDOWN_DRAIN_MS instead of waiting for them to finish

export type MessageQueueWorkerConfig = {
  workerOptions: Required<
    Omit<MessageQueueWorkerOptions, 'globalConcurrency' | 'rateLimit'>
  > &
    Pick<MessageQueueWorkerOptions, 'globalConcurrency' | 'rateLimit'>;
};

export const MESSAGE_QUEUE_WORKER_CONFIG: Record<
  MessageQueue,
  MessageQueueWorkerConfig
> = {
  [MessageQueue.recordExportQueue]: {
    workerOptions: {
      concurrency: 1,
      globalConcurrency: 2,
      lockDuration: 60_000,
      maxStalledCount: 0,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.workspaceDataExportQueue]: {
    workerOptions: {
      concurrency: 1,
      globalConcurrency: 1,
      lockDuration: 60_000,
      maxStalledCount: 2,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.taskAssignedQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.messagingQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.webhookQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.cronQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.emailQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.campaignQueue]: {
    workerOptions: {
      concurrency: 10,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.campaignSendQueue]: {
    workerOptions: {
      concurrency: 10,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.campaignEngagementQueue]: {
    workerOptions: {
      concurrency: 50,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.calendarQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.connectedAccountSyncWebhookQueue]: {
    workerOptions: {
      concurrency: 5,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.contactCreationQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.billingQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.workspaceQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.workspaceDestroyQueue]: {
    workerOptions: {
      concurrency: 1,
      globalConcurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.entityEventsToDbQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.eventLogQueue]: {
    workerOptions: {
      concurrency: 3,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.workflowQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.delayedJobsQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.deleteCascadeQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.logicFunctionQueue]: {
    workerOptions: {
      concurrency: 20,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.lambdaManagementQueue]: {
    workerOptions: {
      concurrency: 2,
      rateLimit: { max: 2, durationMs: 1_000 },
      lockDuration: 60_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.applicationLifecycleHookQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.applicationUpgradeQueue]: {
    workerOptions: {
      concurrency: 2,
      lockDuration: 60_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.triggerQueue]: {
    workerOptions: {
      concurrency: 1,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.aiQueue]: {
    workerOptions: {
      // agent runs wait on the model and their tools most of the time, so several share a worker
      concurrency: 10,
      lockDuration: 30_000,
      maxStalledCount: 1,
      boundedShutdownDrain: false,
    },
  },
  [MessageQueue.aiStreamQueue]: {
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
