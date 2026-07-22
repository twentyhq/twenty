import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { shouldCreateWorkerForQueue } from 'src/engine/core-modules/message-queue/utils/should-create-worker-for-queue.util';

describe('shouldCreateWorkerForQueue', () => {
  it('should create a worker for every queue when no filters are set', () => {
    expect(
      shouldCreateWorkerForQueue({
        queueName: MessageQueue.applicationQueue,
        enabledQueues: [],
        excludedQueues: [],
      }),
    ).toBe(true);
  });

  it('should only create a worker for queues in the enabled list', () => {
    expect(
      shouldCreateWorkerForQueue({
        queueName: MessageQueue.applicationQueue,
        enabledQueues: [MessageQueue.applicationQueue],
        excludedQueues: [],
      }),
    ).toBe(true);

    expect(
      shouldCreateWorkerForQueue({
        queueName: MessageQueue.workflowQueue,
        enabledQueues: [MessageQueue.applicationQueue],
        excludedQueues: [],
      }),
    ).toBe(false);
  });

  it('should not create a worker for excluded queues', () => {
    expect(
      shouldCreateWorkerForQueue({
        queueName: MessageQueue.applicationQueue,
        enabledQueues: [],
        excludedQueues: [MessageQueue.applicationQueue],
      }),
    ).toBe(false);
  });

  it('should apply the excluded list after the enabled list', () => {
    expect(
      shouldCreateWorkerForQueue({
        queueName: MessageQueue.applicationQueue,
        enabledQueues: [MessageQueue.applicationQueue],
        excludedQueues: [MessageQueue.applicationQueue],
      }),
    ).toBe(false);
  });
});
