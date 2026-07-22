import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  parseQueueListFromEnv,
  shouldCreateWorkerForQueue,
} from 'src/engine/core-modules/message-queue/utils/should-create-worker-for-queue.util';

describe('parseQueueListFromEnv', () => {
  it('should return an empty array when the value is undefined', () => {
    expect(parseQueueListFromEnv(undefined)).toEqual([]);
  });

  it('should split, trim and drop empty entries', () => {
    expect(parseQueueListFromEnv('workspace-queue, workflow-queue ,')).toEqual([
      'workspace-queue',
      'workflow-queue',
    ]);
  });
});

describe('shouldCreateWorkerForQueue', () => {
  it('should create a worker for every queue when no filters are set', () => {
    expect(
      shouldCreateWorkerForQueue({
        queueName: MessageQueue.workspaceQueue,
        enabledQueues: [],
        excludedQueues: [],
      }),
    ).toBe(true);
  });

  it('should only create a worker for queues in the enabled list', () => {
    expect(
      shouldCreateWorkerForQueue({
        queueName: MessageQueue.workspaceQueue,
        enabledQueues: [MessageQueue.workspaceQueue],
        excludedQueues: [],
      }),
    ).toBe(true);

    expect(
      shouldCreateWorkerForQueue({
        queueName: MessageQueue.workflowQueue,
        enabledQueues: [MessageQueue.workspaceQueue],
        excludedQueues: [],
      }),
    ).toBe(false);
  });

  it('should not create a worker for excluded queues', () => {
    expect(
      shouldCreateWorkerForQueue({
        queueName: MessageQueue.workspaceQueue,
        enabledQueues: [],
        excludedQueues: [MessageQueue.workspaceQueue],
      }),
    ).toBe(false);
  });

  it('should apply the excluded list after the enabled list', () => {
    expect(
      shouldCreateWorkerForQueue({
        queueName: MessageQueue.workspaceQueue,
        enabledQueues: [MessageQueue.workspaceQueue],
        excludedQueues: [MessageQueue.workspaceQueue],
      }),
    ).toBe(false);
  });
});
