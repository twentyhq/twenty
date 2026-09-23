import {
  RETRYABLE_LOGIC_FUNCTION_ERROR_NAME,
  RetryableLogicFunctionError,
} from 'twenty-shared/logic-function';

import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionJobRunnerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

describe('LogicFunctionJobRunnerService', () => {
  const logicFunctionPayload = {
    logicFunctionId: 'logic-function-id',
    workspaceId: 'workspace-id',
    payload: { newVersion: '1.4.1' },
  };

  const buildService = (
    execute: jest.Mock,
  ): {
    service: LogicFunctionJobRunnerService;
    persistRetryCount: jest.Mock;
  } => ({
    service: new LogicFunctionJobRunnerService({
      execute,
    } as unknown as LogicFunctionExecutorService),
    persistRetryCount: jest.fn(),
  });

  it('does not retry a successful execution', async () => {
    const execute = jest.fn().mockResolvedValue({});
    const { service, persistRetryCount } = buildService(execute);

    await service.run({
      logicFunctionPayload,
      retryLimit: 3,
      persistRetryCount,
    });

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionId: 'logic-function-id',
        workspaceId: 'workspace-id',
        retry: { retryCount: 0, maxRetries: 3 },
      }),
    );
    expect(persistRetryCount).not.toHaveBeenCalled();
  });

  it('persists the next retry count and fails the job on a retryable error', async () => {
    const execute = jest.fn().mockResolvedValue({
      error: {
        errorType: RETRYABLE_LOGIC_FUNCTION_ERROR_NAME,
        errorMessage: 'sandbox unavailable',
      },
    });
    const { service, persistRetryCount } = buildService(execute);

    await expect(
      service.run({
        logicFunctionPayload: {
          ...logicFunctionPayload,
          applicationRetryCount: 1,
        },
        retryLimit: 3,
        persistRetryCount,
      }),
    ).rejects.toThrow(RetryableLogicFunctionError);

    expect(persistRetryCount).toHaveBeenCalledWith(2);
  });

  it('stops retrying once the retry limit is reached', async () => {
    const execute = jest.fn().mockResolvedValue({
      error: {
        errorType: RETRYABLE_LOGIC_FUNCTION_ERROR_NAME,
        errorMessage: 'sandbox unavailable',
      },
    });
    const { service, persistRetryCount } = buildService(execute);

    await service.run({
      logicFunctionPayload: {
        ...logicFunctionPayload,
        applicationRetryCount: 3,
      },
      retryLimit: 3,
      persistRetryCount,
    });

    expect(persistRetryCount).not.toHaveBeenCalled();
  });

  it('does not fail the job when usage was refused', async () => {
    const execute = jest
      .fn()
      .mockRejectedValue(
        new UsageLimitException(
          'Usage limit reached for workspace',
          UsageLimitExceptionCode.QUOTA_EXHAUSTED,
        ),
      );
    const { service, persistRetryCount } = buildService(execute);

    await service.run({
      logicFunctionPayload,
      retryLimit: 3,
      persistRetryCount,
    });

    expect(persistRetryCount).not.toHaveBeenCalled();
  });

  it('does not fail the job when the application is stopped', async () => {
    const execute = jest
      .fn()
      .mockRejectedValue(
        new LogicFunctionException(
          'Application is stopped',
          LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
        ),
      );
    const { service, persistRetryCount } = buildService(execute);

    await service.run({
      logicFunctionPayload,
      retryLimit: 3,
      persistRetryCount,
    });

    expect(persistRetryCount).not.toHaveBeenCalled();
  });
});
