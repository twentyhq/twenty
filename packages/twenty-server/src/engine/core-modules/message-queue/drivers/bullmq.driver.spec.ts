import { Queue } from 'bullmq';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

jest.mock('bullmq', () => ({
  MetricsTime: { ONE_WEEK: 'ONE_WEEK' },
  Queue: jest.fn(),
  Worker: jest.fn(),
}));

describe('BullMQDriver', () => {
  const addJobMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(Queue).mockImplementation(
      () =>
        ({
          add: addJobMock,
        }) as unknown as Queue,
    );
  });

  it('maps portable retry backoff options to BullMQ job options', async () => {
    const bullMQDriver = new BullMQDriver(
      { connection: { host: 'localhost', port: 6379 } },
      {} as MetricsService,
      {} as TwentyConfigService,
    );

    bullMQDriver.register(MessageQueue.logicFunctionQueue);

    await bullMQDriver.add(
      MessageQueue.logicFunctionQueue,
      'LogicFunctionTriggerJob',
      { logicFunctionId: 'logic-function-id' },
      {
        retryLimit: 3,
        backoff: {
          strategy: 'exponential',
          initialDelayMilliseconds: 1_000,
          jitter: 0.5,
        },
      },
    );

    expect(addJobMock).toHaveBeenCalledWith(
      'LogicFunctionTriggerJob',
      { logicFunctionId: 'logic-function-id' },
      expect.objectContaining({
        attempts: 4,
        backoff: {
          type: 'exponential',
          delay: 1_000,
          jitter: 0.5,
        },
      }),
    );
  });
});
