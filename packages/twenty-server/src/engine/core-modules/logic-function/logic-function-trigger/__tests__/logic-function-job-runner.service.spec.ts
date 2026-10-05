import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
  type LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionJobRunnerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';

describe('LogicFunctionJobRunnerService', () => {
  const execute = jest.fn();
  const persistRetryCount = jest.fn();
  const logicFunctionJobRunnerService = new LogicFunctionJobRunnerService({
    execute,
  } as unknown as LogicFunctionExecutorService);

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
    execute.mockRejectedValue(
      new LogicFunctionExecutionException(
        'Logic function with id logic-function-id not found',
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      ),
    );

    await expect(run()).resolves.toBeUndefined();
    expect(persistRetryCount).not.toHaveBeenCalled();
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
