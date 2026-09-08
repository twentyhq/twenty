import { randomUUID } from 'node:crypto';

import { Queue, QueueEvents, Worker } from 'bullmq';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const redisUrl = process.env.APP_PERSISTENCE_TEST_REDIS_URL;
const storageTest = redisUrl ? it : it.skip;

storageTest(
  'retains paid output after retries exhaust so an operator can replay it',
  async () => {
    jest.useRealTimers();
    const address = new URL(redisUrl!);
    const options = {
      connection: {
        host: address.hostname,
        port: Number(address.port || 6379),
        db: Number(address.pathname.slice(1) || 0),
        maxRetriesPerRequest: null,
      },
      prefix: `persistence-verification-${randomUUID()}`,
    };
    const queueName = MessageQueue.workspaceQueue;
    const driver = new BullMQDriver(
      options,
      {} as MetricsService,
      {} as TwentyConfigService,
    );
    driver.register(queueName);
    const queue = new Queue(queueName, options);
    const events = new QueueEvents(queueName, options);
    await events.waitUntilReady();
    const worker = new Worker(
      queueName,
      async () => {
        throw new Error('Database unavailable');
      },
      options,
    );
    try {
      const value = { status: 'READY', markdown: 'Paid result preserved' };
      await driver.add(
        queueName,
        'PersistResult',
        { value },
        {
          retryLimit: 1,
          backoff: { strategy: 'fixed', initialDelayMilliseconds: 10 },
          retainOnFailure: true,
        },
      );
      const [job] = await queue.getJobs([
        'waiting',
        'prioritized',
        'active',
        'delayed',
        'failed',
      ]);
      await expect(job.waitUntilFinished(events, 5000)).rejects.toThrow(
        'Database unavailable',
      );
      const retained = await queue.getJob(job.id!);
      expect(retained?.data).toEqual({ value });
      expect(retained?.attemptsMade).toBe(2);
      expect(await retained?.getState()).toBe('failed');
    } finally {
      await worker.close();
      await events.close();
      await queue.obliterate({ force: true });
      await queue.close();
      await driver.onModuleDestroy();
    }
  },
  15000,
);
