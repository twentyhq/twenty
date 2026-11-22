import { Test } from '@nestjs/testing';

import { RetryableLogicFunctionError } from 'twenty-shared/logic-function';

import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionJobRunnerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const FAILING_FUNCTION_ID = 'failing-function-id';
const FAILING_FUNCTION_UNIVERSAL_IDENTIFIER = 'failing-function';
const HANDLER_FUNCTION_ID = 'handler-function-id';
const HANDLER_FUNCTION_UNIVERSAL_IDENTIFIER = 'handler-function';

const ORIGINAL_PAYLOAD = { slackMessageTimestamp: '1700000000.000100' };

const buildFlatLogicFunctionMaps = ({
  handlerApplicationId = APPLICATION_ID,
  onFailureLogicFunctionUniversalIdentifier = HANDLER_FUNCTION_UNIVERSAL_IDENTIFIER,
}: {
  handlerApplicationId?: string;
  onFailureLogicFunctionUniversalIdentifier?: string | null;
} = {}) => ({
  universalIdentifierById: {
    [FAILING_FUNCTION_ID]: FAILING_FUNCTION_UNIVERSAL_IDENTIFIER,
    [HANDLER_FUNCTION_ID]: HANDLER_FUNCTION_UNIVERSAL_IDENTIFIER,
  },
  byUniversalIdentifier: {
    [FAILING_FUNCTION_UNIVERSAL_IDENTIFIER]: {
      id: FAILING_FUNCTION_ID,
      universalIdentifier: FAILING_FUNCTION_UNIVERSAL_IDENTIFIER,
      applicationId: APPLICATION_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      onFailureLogicFunctionUniversalIdentifier,
      deletedAt: null,
    },
    [HANDLER_FUNCTION_UNIVERSAL_IDENTIFIER]: {
      id: HANDLER_FUNCTION_ID,
      universalIdentifier: HANDLER_FUNCTION_UNIVERSAL_IDENTIFIER,
      applicationId: handlerApplicationId,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      onFailureLogicFunctionUniversalIdentifier: null,
      deletedAt: null,
    },
  },
  universalIdentifiersByApplicationId: {},
});

const FAILED_EXECUTION_RESULT = {
  data: null,
  duration: 1,
  billedDurationMs: 1,
  logs: '',
  status: 'ERROR',
  error: {
    errorType: 'TimeoutError',
    errorMessage: 'Function execution timed out after 240s',
    stackTrace: [],
  },
};

describe('LogicFunctionJobRunnerService', () => {
  let service: LogicFunctionJobRunnerService;
  const executeMock = jest.fn();
  const getOrRecomputeMock = jest.fn();
  const enqueueFailureHandler = jest.fn();

  const run = ({
    attemptsMade = 0,
    retryLimit = 0,
    isFailureHandlerRun,
  }: {
    attemptsMade?: number;
    retryLimit?: number;
    isFailureHandlerRun?: boolean;
  } = {}) =>
    service.run({
      logicFunctionPayload: {
        logicFunctionId: FAILING_FUNCTION_ID,
        workspaceId: WORKSPACE_ID,
        payload: ORIGINAL_PAYLOAD,
        userId: 'user-id',
        isFailureHandlerRun,
      },
      retryLimit,
      attemptsMade,
      persistRetryCount: jest.fn(),
      enqueueFailureHandler,
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    getOrRecomputeMock.mockResolvedValue({
      flatLogicFunctionMaps: buildFlatLogicFunctionMaps(),
    });
    enqueueFailureHandler.mockResolvedValue('job-id');

    const module = await Test.createTestingModule({
      providers: [
        LogicFunctionJobRunnerService,
        {
          provide: LogicFunctionExecutorService,
          useValue: { execute: executeMock },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(LogicFunctionEntity),
          useValue: { existsBy: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: WorkspaceCacheService,
          useValue: { getOrRecompute: getOrRecomputeMock },
        },
      ],
    }).compile();

    service = module.get(LogicFunctionJobRunnerService);
  });

  it('should enqueue the declared failure handler with the original payload when a run fails for good', async () => {
    executeMock.mockResolvedValue(FAILED_EXECUTION_RESULT);

    await expect(run()).resolves.toBeUndefined();

    expect(enqueueFailureHandler).toHaveBeenCalledTimes(1);
    expect(enqueueFailureHandler).toHaveBeenCalledWith({
      jobData: {
        logicFunctionId: HANDLER_FUNCTION_ID,
        workspaceId: WORKSPACE_ID,
        payload: {
          failedLogicFunctionUniversalIdentifier:
            FAILING_FUNCTION_UNIVERSAL_IDENTIFIER,
          payload: ORIGINAL_PAYLOAD,
          error: {
            errorType: 'TimeoutError',
            errorMessage: 'Function execution timed out after 240s',
          },
        },
        userId: 'user-id',
        userWorkspaceId: undefined,
        isFailureHandlerRun: true,
      },
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should not enqueue anything when the run succeeds', async () => {
    executeMock.mockResolvedValue({
      ...FAILED_EXECUTION_RESULT,
      status: 'SUCCESS',
      error: undefined,
    });

    await run();

    expect(enqueueFailureHandler).not.toHaveBeenCalled();
  });

  it('should wait for the retry instead of enqueueing the handler when a retry is scheduled', async () => {
    executeMock.mockResolvedValue({
      ...FAILED_EXECUTION_RESULT,
      error: {
        errorType: 'RetryableLogicFunctionError',
        errorMessage: 'Upstream API is busy',
        stackTrace: [],
      },
    });

    await expect(run({ retryLimit: 3 })).rejects.toThrow(
      RetryableLogicFunctionError,
    );

    expect(enqueueFailureHandler).not.toHaveBeenCalled();
  });

  it('should not enqueue a handler when no failure handler is declared', async () => {
    getOrRecomputeMock.mockResolvedValue({
      flatLogicFunctionMaps: buildFlatLogicFunctionMaps({
        onFailureLogicFunctionUniversalIdentifier: null,
      }),
    });
    executeMock.mockResolvedValue(FAILED_EXECUTION_RESULT);

    await run();

    expect(enqueueFailureHandler).not.toHaveBeenCalled();
  });

  it('should not let a failing failure handler trigger another handler', async () => {
    executeMock.mockResolvedValue(FAILED_EXECUTION_RESULT);

    await run({ isFailureHandlerRun: true });

    expect(enqueueFailureHandler).not.toHaveBeenCalled();
  });

  it('should skip a failure handler that belongs to another application', async () => {
    getOrRecomputeMock.mockResolvedValue({
      flatLogicFunctionMaps: buildFlatLogicFunctionMaps({
        handlerApplicationId: 'other-application-id',
      }),
    });
    executeMock.mockResolvedValue(FAILED_EXECUTION_RESULT);

    await run();

    expect(enqueueFailureHandler).not.toHaveBeenCalled();
  });

  it('should keep the failed run completed when the handler cannot be enqueued', async () => {
    executeMock.mockResolvedValue(FAILED_EXECUTION_RESULT);
    enqueueFailureHandler.mockRejectedValue(new Error('Redis unreachable'));

    await expect(run()).resolves.toBeUndefined();
  });

  it('should enqueue the handler when a platform error uses up the last queue attempt', async () => {
    executeMock.mockRejectedValue(new Error('Lambda unreachable'));

    await expect(run({ retryLimit: 3, attemptsMade: 3 })).rejects.toThrow(
      'Lambda unreachable',
    );

    expect(enqueueFailureHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        jobData: expect.objectContaining({
          payload: expect.objectContaining({
            error: { errorType: 'Error', errorMessage: 'Lambda unreachable' },
          }),
        }),
      }),
    );
  });

  it('should leave a platform error to the queue while attempts remain', async () => {
    executeMock.mockRejectedValue(new Error('Lambda unreachable'));

    await expect(run({ retryLimit: 3, attemptsMade: 1 })).rejects.toThrow(
      'Lambda unreachable',
    );

    expect(enqueueFailureHandler).not.toHaveBeenCalled();
  });
});
