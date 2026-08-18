import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service',
  () => ({
    LogicFunctionExecutorService: class LogicFunctionExecutorService {},
  }),
);

const LOGIC_FUNCTION_JOB_DATA = {
  logicFunctionId: '20202020-1c25-4d02-bf25-6aecc3f3f18b',
  workspaceId: '20202020-f737-4c45-8937-3501c0716ac9',
  payload: { recordId: '20202020-1b3f-4882-90d2-093217af7eae' },
};

describe('LogicFunctionTriggerJob', () => {
  const executeLogicFunctionMock = jest.fn();
  const logicFunctionTriggerJob = new LogicFunctionTriggerJob({
    execute: executeLogicFunctionMock,
  } as unknown as LogicFunctionExecutorService);

  beforeEach(() => {
    executeLogicFunctionMock.mockReset();
  });

  it('fails the queue attempt when user code explicitly reports a retryable error', async () => {
    executeLogicFunctionMock.mockResolvedValue({
      data: null,
      duration: 12,
      logs: '',
      status: LogicFunctionExecutionStatus.ERROR,
      error: {
        errorType: 'RetryableLogicFunctionError',
        errorMessage: 'Recall bot is not visible yet',
        stackTrace: [],
      },
    });

    await expect(
      logicFunctionTriggerJob.handle(LOGIC_FUNCTION_JOB_DATA),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: 'Recall bot is not visible yet',
    });
  });

  it('completes the queue attempt for an ordinary user-code error', async () => {
    executeLogicFunctionMock.mockResolvedValue({
      data: null,
      duration: 12,
      logs: '',
      status: LogicFunctionExecutionStatus.ERROR,
      error: {
        errorType: 'TypeError',
        errorMessage: 'Cannot read properties of undefined',
        stackTrace: [],
      },
    });

    await expect(
      logicFunctionTriggerJob.handle(LOGIC_FUNCTION_JOB_DATA),
    ).resolves.toBeUndefined();
  });

  it('keeps propagating platform execution failures to the queue', async () => {
    const platformExecutionError = new Error('Lambda invocation failed');

    executeLogicFunctionMock.mockRejectedValue(platformExecutionError);

    await expect(
      logicFunctionTriggerJob.handle(LOGIC_FUNCTION_JOB_DATA),
    ).rejects.toBe(platformExecutionError);
  });
});
