import { SyncDriver } from 'src/engine/core-modules/message-queue/drivers/sync.driver';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

describe('SyncDriver - idempotency keys', () => {
  let driver: SyncDriver;
  const queueName = MessageQueue.taskAssignedQueue;
  const handler = jest.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    jest.clearAllMocks();

    driver = new SyncDriver();
    driver.work(queueName, handler);
  });

  it('should process a job when idempotencyKey is set', async () => {
    await driver.add(queueName, 'test-job', { foo: 'bar' }, {
      idempotencyKey: 'key-1',
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should no-op a duplicate add with the same idempotencyKey', async () => {
    await driver.add(queueName, 'test-job', { foo: 'bar' }, {
      idempotencyKey: 'key-1',
    });

    await driver.add(queueName, 'test-job', { foo: 'bar' }, {
      idempotencyKey: 'key-1',
    });

    // Handler should only be called once (second add is deduped)
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should process different idempotencyKeys independently', async () => {
    await driver.add(queueName, 'test-job', { foo: 'bar' }, {
      idempotencyKey: 'key-1',
    });

    await driver.add(queueName, 'test-job', { baz: 'qux' }, {
      idempotencyKey: 'key-2',
    });

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('should process jobs without idempotencyKey normally', async () => {
    await driver.add(queueName, 'test-job', { foo: 'bar' });

    await driver.add(queueName, 'test-job', { foo: 'bar' });

    expect(handler).toHaveBeenCalledTimes(2);
  });
});
