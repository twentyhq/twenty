import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
  type LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionJobRunnerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

describe('LogicFunctionJobRunnerService', () => {
  const execute = jest.fn();
  const existsBy = jest.fn();
  const persistRetryCount = jest.fn();
  const logicFunctionJobRunnerService = new LogicFunctionJobRunnerService(
    { execute } as unknown as LogicFunctionExecutorService,
    {
      existsBy,
    } as unknown as WorkspaceScopedRepository<LogicFunctionEntity>,
  );
  const notFoundError = new LogicFunctionExecutionException(
    'Logic function with id logic-function-id not found',
    LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
  );

  const run = () =>
    logicFunctionJobRunnerService.run({
      logicFunctionPayload: {
        logicFunctionId: 'logic-function-id',
        workspaceId: 'workspace-id',
      },
      retryLimit: 3,
      persistRetryCount,
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips the job when its application was uninstalled', async () => {
    execute.mockRejectedValue(notFoundError);
    existsBy.mockResolvedValue(false);

    await expect(run()).resolves.toBeUndefined();
    expect(existsBy).toHaveBeenCalledWith('workspace-id', {
      id: 'logic-function-id',
    });
    expect(persistRetryCount).not.toHaveBeenCalled();
  });

  it('fails the job when the logic function still exists in the database', async () => {
    execute.mockRejectedValue(notFoundError);
    existsBy.mockResolvedValue(true);

    await expect(run()).rejects.toBe(notFoundError);
  });

  it('fails the job on other execution errors', async () => {
    const rateLimitError = new LogicFunctionExecutionException(
      'Logic function execution rate limit exceeded',
      LogicFunctionExecutionExceptionCode.RATE_LIMIT_EXCEEDED,
    );

    execute.mockRejectedValue(rateLimitError);

    await expect(run()).rejects.toBe(rateLimitError);
  });
});
