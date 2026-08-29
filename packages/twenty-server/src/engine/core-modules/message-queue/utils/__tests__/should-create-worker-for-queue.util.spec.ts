import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { shouldCreateWorkerForQueue } from 'src/engine/core-modules/message-queue/utils/should-create-worker-for-queue.util';

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

  it('should create a worker when the queue passes the allowlist and is not in the denylist', () => {
    expect(
      shouldCreateWorkerForQueue({
        queueName: MessageQueue.workspaceQueue,
        enabledQueues: [
          MessageQueue.workspaceQueue,
          MessageQueue.workflowQueue,
        ],
        excludedQueues: [MessageQueue.aiQueue],
      }),
    ).toBe(true);
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
