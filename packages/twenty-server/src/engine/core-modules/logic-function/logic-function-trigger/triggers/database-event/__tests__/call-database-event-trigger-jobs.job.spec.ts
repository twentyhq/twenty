import { Test, TestingModule } from '@nestjs/testing';

import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ApplicationJobEnqueueThrottlerService } from 'src/engine/core-modules/message-queue/services/application-job-enqueue-throttler.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { CallDatabaseEventTriggerJobsJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/call-database-event-trigger-jobs.job';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { transformEventBatchToEventPayloads } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/transform-event-batch-to-event-payloads';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.mock(
  'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util',
);
jest.mock(
  'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/utils/transform-event-batch-to-event-payloads',
);

const findActiveFlatApplicationByIdMock =
  findActiveFlatApplicationById as jest.Mock;
const transformEventBatchToEventPayloadsMock =
  transformEventBatchToEventPayloads as jest.Mock;

describe('CallDatabaseEventTriggerJobsJob', () => {
  let job: CallDatabaseEventTriggerJobsJob;
  const bulkAdd = jest.fn();
  const throttleOrThrow = jest.fn();

  const buildLogicFunction = (applicationId: string) => ({
    applicationId,
    deletedAt: null,
    databaseEventTriggerSettings: { eventName: 'person.created' },
  });

  const workspaceEventBatch = {
    workspaceId: 'workspace-id',
    name: 'person.created',
    events: [],
  } as never;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallDatabaseEventTriggerJobsJob,
        {
          provide: getQueueToken(MessageQueue.logicFunctionQueue),
          useValue: { bulkAdd },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockResolvedValue({
              flatLogicFunctionMaps: {
                byUniversalIdentifier: {
                  a: buildLogicFunction('app-1'),
                  b: buildLogicFunction('app-2'),
                },
              },
              flatApplicationMaps: {},
            }),
          },
        },
        {
          provide: ApplicationJobEnqueueThrottlerService,
          useValue: { throttleOrThrow },
        },
      ],
    }).compile();

    job = module.get(CallDatabaseEventTriggerJobsJob);

    findActiveFlatApplicationByIdMock.mockImplementation(
      (_maps, applicationId: string) => ({
        applicationRegistrationId: `${applicationId}-registration`,
      }),
    );
    transformEventBatchToEventPayloadsMock.mockImplementation(
      ({ logicFunctions }) => [
        { applicationId: logicFunctions[0].applicationId },
      ],
    );
  });

  it('should skip the throttled application and still enqueue the others', async () => {
    throttleOrThrow.mockImplementation(async ({ applicationId }) => {
      if (applicationId === 'app-1') {
        throw new ThrottlerException(
          'Application job enqueue limit reached',
          ThrottlerExceptionCode.LIMIT_REACHED,
        );
      }
    });

    await job.handle(workspaceEventBatch);

    expect(throttleOrThrow).toHaveBeenCalledTimes(2);
    expect(throttleOrThrow).toHaveBeenCalledWith({
      applicationId: 'app-1',
      applicationRegistrationId: 'app-1-registration',
      jobCount: 1,
    });
    expect(throttleOrThrow).toHaveBeenCalledWith({
      applicationId: 'app-2',
      applicationRegistrationId: 'app-2-registration',
      jobCount: 1,
    });

    expect(bulkAdd).toHaveBeenCalledTimes(1);
    expect(bulkAdd).toHaveBeenCalledWith(
      expect.any(String),
      [{ applicationId: 'app-2' }],
      { retryLimit: 3 },
    );
  });

  it('should rethrow non-throttler errors', async () => {
    throttleOrThrow.mockRejectedValue(new Error('unexpected'));

    await expect(job.handle(workspaceEventBatch)).rejects.toThrow('unexpected');
    expect(bulkAdd).not.toHaveBeenCalled();
  });
});
