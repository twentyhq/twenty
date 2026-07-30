import { ENQUEUE_JOB_PRIORITY } from 'src/engine/core-modules/application/application-job/constants/enqueue-job.constant';
import { type EnqueueJobInputDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-job.input';
import { ApplicationJobService } from 'src/engine/core-modules/application/application-job/services/application-job.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const APPLICATION_ID = 'c2a9e9d0-1f42-4f0e-9a0e-6d2e4b2a1f01';
const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const TARGET_UNIVERSAL_IDENTIFIER = '5a2f4d2a-1a1e-4c66-8a54-1f0a2b3c4d5e';
const TARGET_LOGIC_FUNCTION_ID = 'ab6a2e5c-8c1f-4d0a-9bd1-52c1f5a9e100';

const buildFlatLogicFunction = (
  overrides: Partial<{
    applicationId: string;
    deletedAt: Date | null;
  }> = {},
) => ({
  id: TARGET_LOGIC_FUNCTION_ID,
  universalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
  applicationId: APPLICATION_ID,
  deletedAt: null,
  ...overrides,
});

describe('ApplicationJobService', () => {
  let service: ApplicationJobService;
  let workspaceCacheService: jest.Mocked<
    Pick<WorkspaceCacheService, 'getOrRecompute'>
  >;
  let messageQueueService: jest.Mocked<Pick<MessageQueueService, 'add'>>;

  const setCachedLogicFunctions = (
    flatLogicFunctions: ReturnType<typeof buildFlatLogicFunction>[],
  ) => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatLogicFunctionMaps: {
        byUniversalIdentifier: Object.fromEntries(
          flatLogicFunctions.map((flatLogicFunction) => [
            flatLogicFunction.universalIdentifier,
            flatLogicFunction,
          ]),
        ),
      },
      // oxlint-disable-next-line typescript/no-explicit-any
    } as any);
  };

  const enqueueJob = (
    input: EnqueueJobInputDTO,
    overrides: { userId?: string | null; userWorkspaceId?: string | null } = {},
  ) =>
    service.enqueueJob({
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      userId: overrides.userId ?? null,
      userWorkspaceId: overrides.userWorkspaceId ?? null,
      input,
    });

  beforeEach(() => {
    jest.clearAllMocks();

    workspaceCacheService = { getOrRecompute: jest.fn() };
    setCachedLogicFunctions([buildFlatLogicFunction()]);
    messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };

    service = new ApplicationJobService(
      workspaceCacheService as unknown as WorkspaceCacheService,
      messageQueueService as unknown as MessageQueueService,
    );
  });

  it('should enqueue a logic function trigger job with the provided job options', async () => {
    const result = await enqueueJob({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      payload: { batchIndex: 2 },
      retryLimit: 3,
      delayMs: 1000,
    });

    expect(result).toEqual({
      enqueued: true,
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });

    expect(messageQueueService.add).toHaveBeenCalledWith(
      LogicFunctionTriggerJob.name,
      {
        logicFunctionId: TARGET_LOGIC_FUNCTION_ID,
        workspaceId: WORKSPACE_ID,
        payload: { batchIndex: 2 },
      },
      { retryLimit: 3, priority: ENQUEUE_JOB_PRIORITY, delay: 1000 },
    );
  });

  it('should always enqueue at the lowest priority so platform jobs go first', async () => {
    await enqueueJob({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });

    expect(messageQueueService.add).toHaveBeenCalledWith(
      LogicFunctionTriggerJob.name,
      expect.anything(),
      expect.objectContaining({ priority: ENQUEUE_JOB_PRIORITY }),
    );
  });

  it('should default to no retry and omit unset queue options', async () => {
    await enqueueJob({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });

    expect(messageQueueService.add).toHaveBeenCalledWith(
      LogicFunctionTriggerJob.name,
      {
        logicFunctionId: TARGET_LOGIC_FUNCTION_ID,
        workspaceId: WORKSPACE_ID,
        payload: {},
      },
      { retryLimit: 0, priority: ENQUEUE_JOB_PRIORITY },
    );
  });

  it('should forward the acting user so the queued run keeps the caller permissions', async () => {
    await enqueueJob(
      { logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER },
      { userId: 'user-1', userWorkspaceId: 'user-workspace-1' },
    );

    expect(messageQueueService.add).toHaveBeenCalledWith(
      LogicFunctionTriggerJob.name,
      expect.objectContaining({
        userId: 'user-1',
        userWorkspaceId: 'user-workspace-1',
      }),
      expect.anything(),
    );
  });

  it('should resolve the target from the workspace cache instead of the database', async () => {
    await enqueueJob({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });

    expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledWith(
      WORKSPACE_ID,
      ['flatLogicFunctionMaps'],
    );
  });

  it('should throw LOGIC_FUNCTION_NOT_FOUND when the function belongs to another application', async () => {
    setCachedLogicFunctions([
      buildFlatLogicFunction({ applicationId: 'another-application-id' }),
    ]);

    await expect(
      enqueueJob({
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      }),
    ).rejects.toMatchObject({
      code: ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('should throw LOGIC_FUNCTION_NOT_FOUND when the function is soft deleted', async () => {
    setCachedLogicFunctions([
      buildFlatLogicFunction({ deletedAt: new Date('2026-01-01') }),
    ]);

    await expect(
      enqueueJob({
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      }),
    ).rejects.toMatchObject({
      code: ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('should throw LOGIC_FUNCTION_NOT_FOUND when the function is unknown', async () => {
    setCachedLogicFunctions([]);

    await expect(
      enqueueJob({
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      }),
    ).rejects.toThrow(ApplicationException);

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });
});
