import { RetryableLogicFunctionError } from 'twenty-shared/logic-function';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { type LogicFunctionJobRunnerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { SERVER_CRON_MAX_STEPS_PER_TICK } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-max-steps-per-tick.constant';
import { ServerCronTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/jobs/server-cron-trigger.job';
import { type ServerCronDispatchRateLimiterService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/services/server-cron-dispatch-rate-limiter.service';
import { type ServerCronDispatchTargetResolverService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/services/server-cron-dispatch-target-resolver.service';
import { type ServerCronTriggerJobData } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/types/server-cron-trigger-job-data.type';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const OWNER_WORKSPACE_ID = '20202020-0000-4d02-bf25-6aeccf7ea419';
const TARGET_WORKSPACE_ID = '20202020-1111-4d02-bf25-6aeccf7ea419';
const DROPPED_WORKSPACE_ID = '20202020-2222-4d02-bf25-6aeccf7ea419';
const TARGET_UNIVERSAL_IDENTIFIER = 'b1b2c3d4-5c01-4a7b-8c9d-0e1f2a3b4c5d';
const SCHEDULED_AT_EPOCH_MS = Date.parse('2026-09-23T04:30:00.000Z');

const STEP_JOB_DATA: ServerCronTriggerJobData = {
  workspaceId: OWNER_WORKSPACE_ID,
  logicFunctionId: 'dispatcher-logic-function-id',
  logicFunctionUniversalIdentifier: 'a1b2c3d4-5c01-4a7b-8c9d-0e1f2a3b4c5d',
  applicationRegistrationId: 'registration-1',
  scheduledAtEpochMs: SCHEDULED_AT_EPOCH_MS,
  step: 0,
};

const STEP_JOB_ID = `server-cron.registration-1.a1b2c3d4-5c01-4a7b-8c9d-0e1f2a3b4c5d.${SCHEDULED_AT_EPOCH_MS}.0`;

describe('ServerCronTriggerJob', () => {
  const run = jest.fn();
  const resolveDispatchTargets = jest.fn();
  const computeDispatchDelaysMs = jest.fn();
  const getOrRecompute = jest.fn();
  const incrementCounterBy = jest.fn();
  const bulkAdd = jest.fn();
  const cacheGet = jest.fn();
  const cacheSet = jest.fn();
  const jobContext = { retryLimit: 3, updateData: jest.fn() };

  const job = new ServerCronTriggerJob(
    { run } as unknown as LogicFunctionJobRunnerService,
    {
      resolveDispatchTargets,
    } as unknown as ServerCronDispatchTargetResolverService,
    {
      computeDispatchDelaysMs,
    } as unknown as ServerCronDispatchRateLimiterService,
    { getOrRecompute } as unknown as WorkspaceCacheService,
    { incrementCounterBy } as unknown as MetricsService,
    { bulkAdd } as unknown as MessageQueueService,
    { get: cacheGet, set: cacheSet } as unknown as CacheStorageService,
  );

  const mockDispatcherFunction = (flatLogicFunction: object) =>
    getOrRecompute.mockResolvedValue({
      flatLogicFunctionMaps: {
        byUniversalIdentifier: { 'dispatcher-universal-id': flatLogicFunction },
        universalIdentifierById: {
          'dispatcher-logic-function-id': 'dispatcher-universal-id',
        },
      },
    });

  const mockDispatcherResult = (data: unknown) =>
    run.mockResolvedValue({ data, duration: 10, status: 'SUCCESS' });

  beforeEach(() => {
    jest.clearAllMocks();
    cacheGet.mockResolvedValue(undefined);
    mockDispatcherFunction({
      id: 'dispatcher-logic-function-id',
      universalIdentifier: 'dispatcher-universal-id',
      deletedAt: null,
      serverCronTriggerSettings: { pattern: '30 4 * * *' },
    });
    resolveDispatchTargets.mockImplementation(async ({ dispatches }) => ({
      resolvedDispatches: dispatches
        .filter(
          (dispatch: { workspaceId: string }) =>
            dispatch.workspaceId !== DROPPED_WORKSPACE_ID,
        )
        .map((dispatch: object) => ({
          ...dispatch,
          logicFunctionId: 'target-logic-function-id',
        })),
      droppedDispatches: dispatches.filter(
        (dispatch: { workspaceId: string }) =>
          dispatch.workspaceId === DROPPED_WORKSPACE_ID,
      ),
    }));
    computeDispatchDelaysMs.mockImplementation(async ({ dispatchCount }) =>
      Array.from({ length: dispatchCount }, () => 0),
    );
  });

  it('runs the handler, enqueues resolved dispatches and the next step', async () => {
    mockDispatcherResult({
      dispatches: [
        {
          workspaceId: TARGET_WORKSPACE_ID,
          targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
          payload: { bots: [{ id: 'bot-1' }] },
          delayMs: 5_000,
        },
        {
          workspaceId: DROPPED_WORKSPACE_ID,
          targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
        },
      ],
      next: { cursor: { nextPath: '/bot/?cursor=abc' }, delayMs: 20_000 },
    });

    await job.handle(STEP_JOB_DATA, jobContext);

    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionPayload: expect.objectContaining({
          logicFunctionId: 'dispatcher-logic-function-id',
          workspaceId: OWNER_WORKSPACE_ID,
          payload: { scheduledAt: '2026-09-23T04:30:00.000Z', step: 0 },
        }),
        retryLimit: 3,
      }),
    );
    expect(bulkAdd).toHaveBeenNthCalledWith(
      1,
      LogicFunctionTriggerJob.name,
      [
        {
          data: {
            logicFunctionId: 'target-logic-function-id',
            workspaceId: TARGET_WORKSPACE_ID,
            payload: { bots: [{ id: 'bot-1' }] },
          },
          jobId: `${STEP_JOB_ID}.${TARGET_WORKSPACE_ID}.${TARGET_UNIVERSAL_IDENTIFIER}`,
          delay: 5_000,
        },
      ],
      expect.objectContaining({
        retryLimit: 3,
        priority: 10,
        allowDuplicatedPrefixes: true,
      }),
    );
    expect(bulkAdd).toHaveBeenNthCalledWith(
      2,
      ServerCronTriggerJob.name,
      [
        {
          data: {
            ...STEP_JOB_DATA,
            step: 1,
            cursor: { nextPath: '/bot/?cursor=abc' },
          },
          jobId: `server-cron.registration-1.a1b2c3d4-5c01-4a7b-8c9d-0e1f2a3b4c5d.${SCHEDULED_AT_EPOCH_MS}.1`,
          delay: 20_000,
        },
      ],
      expect.objectContaining({ retryLimit: 3, allowDuplicatedPrefixes: true }),
    );
    expect(cacheSet).toHaveBeenCalledWith(
      `logic-function-server-cron-step-done:${STEP_JOB_ID}`,
      true,
      expect.any(Number),
    );
    expect(incrementCounterBy).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1,
        key: 'server-cron/dispatch-dropped',
      }),
    );
  });

  it('passes the cursor of a continuation step to the handler', async () => {
    mockDispatcherResult({ dispatches: [] });

    await job.handle(
      { ...STEP_JOB_DATA, step: 1, cursor: { nextPath: '/bot/?cursor=abc' } },
      jobContext,
    );

    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionPayload: expect.objectContaining({
          payload: {
            scheduledAt: '2026-09-23T04:30:00.000Z',
            step: 1,
            cursor: { nextPath: '/bot/?cursor=abc' },
          },
        }),
      }),
    );
    expect(bulkAdd).not.toHaveBeenCalled();
  });

  it('delays dispatches by the rate limiter when it exceeds their own delay', async () => {
    computeDispatchDelaysMs.mockResolvedValue([30_000]);
    mockDispatcherResult({
      dispatches: [
        {
          workspaceId: TARGET_WORKSPACE_ID,
          targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
          delayMs: 5_000,
        },
      ],
    });

    await job.handle(STEP_JOB_DATA, jobContext);

    expect(bulkAdd.mock.calls[0][1][0].delay).toBe(30_000);
  });

  it('skips a step that already completed', async () => {
    cacheGet.mockResolvedValue(true);

    await job.handle(STEP_JOB_DATA, jobContext);

    expect(run).not.toHaveBeenCalled();
    expect(bulkAdd).not.toHaveBeenCalled();
  });

  it('stops when the dispatcher lost its server cron trigger', async () => {
    mockDispatcherFunction({
      id: 'dispatcher-logic-function-id',
      deletedAt: null,
      serverCronTriggerSettings: null,
    });

    await job.handle(STEP_JOB_DATA, jobContext);

    expect(run).not.toHaveBeenCalled();
    expect(bulkAdd).not.toHaveBeenCalled();
  });

  it('dispatches nothing for an invalid result and does not retry', async () => {
    mockDispatcherResult({ workspaceId: TARGET_WORKSPACE_ID });

    await expect(
      job.handle(STEP_JOB_DATA, jobContext),
    ).resolves.toBeUndefined();

    expect(bulkAdd).not.toHaveBeenCalled();
    expect(cacheSet).not.toHaveBeenCalled();
    expect(incrementCounterBy).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'server-cron/step-failed',
        attributes: expect.objectContaining({ reason: 'invalid-result' }),
      }),
    );
  });

  it('dispatches nothing when the handler returned an error', async () => {
    run.mockResolvedValue({
      data: null,
      duration: 10,
      status: 'ERROR',
      error: { errorType: 'Error', errorMessage: 'Recall is down' },
    });

    await job.handle(STEP_JOB_DATA, jobContext);

    expect(bulkAdd).not.toHaveBeenCalled();
  });

  it('dispatches nothing when the execution was skipped', async () => {
    run.mockResolvedValue(undefined);

    await job.handle(STEP_JOB_DATA, jobContext);

    expect(bulkAdd).not.toHaveBeenCalled();
  });

  it('lets a retryable error fail the job so the queue retries it', async () => {
    run.mockRejectedValue(new RetryableLogicFunctionError('Recall 429'));

    await expect(job.handle(STEP_JOB_DATA, jobContext)).rejects.toThrow(
      RetryableLogicFunctionError,
    );
    expect(bulkAdd).not.toHaveBeenCalled();
  });

  it('stops the chain when the dispatcher can no longer run in this workspace', async () => {
    run.mockRejectedValue(
      new LogicFunctionExecutionException(
        'not the owner workspace',
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      ),
    );

    await expect(
      job.handle(STEP_JOB_DATA, jobContext),
    ).resolves.toBeUndefined();
    expect(bulkAdd).not.toHaveBeenCalled();
  });

  it('does not enqueue a step beyond the maximum', async () => {
    mockDispatcherResult({ dispatches: [], next: { cursor: {} } });

    await job.handle(
      { ...STEP_JOB_DATA, step: SERVER_CRON_MAX_STEPS_PER_TICK - 1 },
      jobContext,
    );

    expect(bulkAdd).not.toHaveBeenCalled();
    expect(incrementCounterBy).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({ reason: 'max-steps-reached' }),
      }),
    );
  });

  it('produces the same dispatch job ids when a step is retried', async () => {
    mockDispatcherResult({
      dispatches: [
        {
          workspaceId: TARGET_WORKSPACE_ID,
          targetLogicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    await job.handle(STEP_JOB_DATA, jobContext);
    await job.handle(STEP_JOB_DATA, jobContext);

    expect(bulkAdd.mock.calls[0][1][0].jobId).toBe(
      bulkAdd.mock.calls[1][1][0].jobId,
    );
  });
});
