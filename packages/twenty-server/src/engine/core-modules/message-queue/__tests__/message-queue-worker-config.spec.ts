import {
  getLogicFunctionQueueConcurrency,
  MESSAGE_QUEUE_WORKER_CONFIG,
} from 'src/engine/core-modules/message-queue/message-queue-worker-config.constant';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

describe('MessageQueueWorkerConfig - logicFunctionQueue', () => {
  const originalEnv = process.env.LOGIC_FUNCTION_QUEUE_CONCURRENCY;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.LOGIC_FUNCTION_QUEUE_CONCURRENCY = originalEnv;
    } else {
      delete process.env.LOGIC_FUNCTION_QUEUE_CONCURRENCY;
    }
  });

  it('defaults to 20 when env variable is not set', () => {
    delete process.env.LOGIC_FUNCTION_QUEUE_CONCURRENCY;
    expect(getLogicFunctionQueueConcurrency()).toBe(20);
  });

  it('uses configured concurrency when valid positive integer is provided', () => {
    process.env.LOGIC_FUNCTION_QUEUE_CONCURRENCY = '5';
    expect(getLogicFunctionQueueConcurrency()).toBe(5);

    process.env.LOGIC_FUNCTION_QUEUE_CONCURRENCY = '1';
    expect(getLogicFunctionQueueConcurrency()).toBe(1);
  });

  it('falls back to 20 when env variable is invalid or non-positive', () => {
    process.env.LOGIC_FUNCTION_QUEUE_CONCURRENCY = '0';
    expect(getLogicFunctionQueueConcurrency()).toBe(20);

    process.env.LOGIC_FUNCTION_QUEUE_CONCURRENCY = '-10';
    expect(getLogicFunctionQueueConcurrency()).toBe(20);

    process.env.LOGIC_FUNCTION_QUEUE_CONCURRENCY = 'invalid';
    expect(getLogicFunctionQueueConcurrency()).toBe(20);
  });

  it('declares logicFunctionQueue worker options with concurrency', () => {
    const config = MESSAGE_QUEUE_WORKER_CONFIG[MessageQueue.logicFunctionQueue];

    expect(config).toBeDefined();
    expect(config.workerOptions.concurrency).toBeGreaterThan(0);
    expect(config.workerOptions.lockDuration).toBe(30_000);
  });
});
