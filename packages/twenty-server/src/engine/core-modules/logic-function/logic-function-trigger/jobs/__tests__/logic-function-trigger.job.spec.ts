import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const buildExecuteResult = (error?: {
  errorMessage: string;
}): LogicFunctionExecuteResult => ({
  data: null,
  duration: 1,
  logs: '',
  status: error
    ? LogicFunctionExecutionStatus.ERROR
    : LogicFunctionExecutionStatus.SUCCESS,
  ...(error
    ? {
        error: {
          errorType: 'Error',
          errorMessage: error.errorMessage,
          stackTrace: '',
        },
      }
    : {}),
});

const buildFlatLogicFunctionMaps = (
  flatLogicFunctions: { id: string; shouldRetryOnFailure: boolean }[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatLogicFunctions.map((flatLogicFunction) => [
      `uid-${flatLogicFunction.id}`,
      { ...flatLogicFunction, universalIdentifier: `uid-${flatLogicFunction.id}` },
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatLogicFunctions.map((flatLogicFunction) => [
      flatLogicFunction.id,
      `uid-${flatLogicFunction.id}`,
    ]),
  ),
});

describe('LogicFunctionTriggerJob', () => {
  let job: LogicFunctionTriggerJob;
  let logicFunctionExecutorService: jest.Mocked<
    Pick<LogicFunctionExecutorService, 'execute'>
  >;
  let workspaceCacheService: jest.Mocked<
    Pick<WorkspaceCacheService, 'getOrRecompute'>
  >;

  beforeEach(() => {
    logicFunctionExecutorService = {
      execute: jest.fn().mockResolvedValue(buildExecuteResult()),
    };

    workspaceCacheService = {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatLogicFunctionMaps: buildFlatLogicFunctionMaps([
          { id: 'fn-1', shouldRetryOnFailure: false },
          { id: 'fn-2', shouldRetryOnFailure: true },
        ]),
      }),
    } as unknown as jest.Mocked<
      Pick<WorkspaceCacheService, 'getOrRecompute'>
    >;

    job = new LogicFunctionTriggerJob(
      logicFunctionExecutorService as unknown as LogicFunctionExecutorService,
      workspaceCacheService as unknown as WorkspaceCacheService,
    );
  });

  it('executes every payload', async () => {
    await job.handle([
      { logicFunctionId: 'fn-1', workspaceId: 'ws-1' },
      { logicFunctionId: 'fn-2', workspaceId: 'ws-1', payload: { a: 1 } },
    ]);

    expect(logicFunctionExecutorService.execute).toHaveBeenCalledTimes(2);
    expect(logicFunctionExecutorService.execute).toHaveBeenCalledWith(
      expect.objectContaining({ logicFunctionId: 'fn-2', payload: { a: 1 } }),
    );
  });

  it('swallows the failure when the function does not declare shouldRetryOnFailure', async () => {
    logicFunctionExecutorService.execute.mockResolvedValue(
      buildExecuteResult({ errorMessage: 'boom' }),
    );

    await expect(
      job.handle([{ logicFunctionId: 'fn-1', workspaceId: 'ws-1' }]),
    ).resolves.toBeUndefined();
  });

  it('throws on failure when the function declares shouldRetryOnFailure so the queue retries', async () => {
    logicFunctionExecutorService.execute.mockResolvedValue(
      buildExecuteResult({ errorMessage: 'boom' }),
    );

    await expect(
      job.handle([{ logicFunctionId: 'fn-2', workspaceId: 'ws-1' }]),
    ).rejects.toThrow('Logic function fn-2 failed: boom');
  });

  it('does not fetch function metadata when the execution succeeds', async () => {
    await job.handle([{ logicFunctionId: 'fn-1', workspaceId: 'ws-1' }]);

    expect(workspaceCacheService.getOrRecompute).not.toHaveBeenCalled();
  });

  it('swallows the failure when the function is no longer in the workspace cache', async () => {
    logicFunctionExecutorService.execute.mockResolvedValue(
      buildExecuteResult({ errorMessage: 'boom' }),
    );

    await expect(
      job.handle([{ logicFunctionId: 'fn-gone', workspaceId: 'ws-1' }]),
    ).resolves.toBeUndefined();
  });
});
