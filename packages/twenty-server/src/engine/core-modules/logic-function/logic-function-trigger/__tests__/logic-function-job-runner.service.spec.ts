import { Test } from '@nestjs/testing';

import { RetryableLogicFunctionError } from 'twenty-shared/logic-function';

import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  LogicFunctionJobRunnerService,
  type LogicFunctionJobPayload,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

const LOGIC_FUNCTION_PAYLOAD: LogicFunctionJobPayload = {
  logicFunctionId: 'logic-function-id',
  workspaceId: 'workspace-id',
};

const RETRYABLE_RESULT: LogicFunctionExecuteResult = {
  data: null,
  logs: '',
  duration: 120,
  billedDurationMs: 120,
  status: LogicFunctionExecutionStatus.ERROR,
  error: {
    errorType: 'RetryableLogicFunctionError',
    errorMessage: 'Upstream API returned 503',
    stackTrace: [],
  },
};

const createJobRunnerService = async (execute: jest.Mock) => {
  const testingModule = await Test.createTestingModule({
    providers: [
      LogicFunctionJobRunnerService,
      { provide: LogicFunctionExecutorService, useValue: { execute } },
    ],
  })
    .useMocker(() => ({}))
    .compile();

  return testingModule.get(LogicFunctionJobRunnerService);
};

describe('LogicFunctionJobRunnerService', () => {
  it('requeues a retryable failure with retries left', async () => {
    const execute = jest.fn().mockResolvedValue(RETRYABLE_RESULT);
    const jobRunnerService = await createJobRunnerService(execute);
    const persistRetryCount = jest.fn();

    await expect(
      jobRunnerService.run({
        logicFunctionPayload: {
          ...LOGIC_FUNCTION_PAYLOAD,
          applicationRetryCount: 1,
        },
        retryLimit: 3,
        persistRetryCount,
      }),
    ).rejects.toThrow(RetryableLogicFunctionError);

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ retry: { retryCount: 1, maxRetries: 3 } }),
    );
    expect(persistRetryCount).toHaveBeenCalledWith(2);
  });

  it('stops retrying once the last attempt has failed', async () => {
    const jobRunnerService = await createJobRunnerService(
      jest.fn().mockResolvedValue(RETRYABLE_RESULT),
    );
    const persistRetryCount = jest.fn();

    await expect(
      jobRunnerService.run({
        logicFunctionPayload: {
          ...LOGIC_FUNCTION_PAYLOAD,
          applicationRetryCount: 3,
        },
        retryLimit: 3,
        persistRetryCount,
      }),
    ).resolves.toBeUndefined();

    expect(persistRetryCount).not.toHaveBeenCalled();
  });

  it('fails the job on an unexpected platform error', async () => {
    const jobRunnerService = await createJobRunnerService(
      jest.fn().mockRejectedValue(new Error('Lambda unavailable')),
    );

    await expect(
      jobRunnerService.run({
        logicFunctionPayload: LOGIC_FUNCTION_PAYLOAD,
        retryLimit: 3,
        persistRetryCount: jest.fn(),
      }),
    ).rejects.toThrow('Lambda unavailable');
  });
});
