import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

const LOGIC_FUNCTION_JOB_DATA = {
  logicFunctionId: '20202020-1c25-4d02-bf25-6aecc3f3f18b',
  workspaceId: '20202020-f737-4c45-8937-3501c0716ac9',
  payload: { recordId: '20202020-1b3f-4882-90d2-093217af7eae' },
};

describe('LogicFunctionTriggerJob', () => {
  const executeLogicFunction = jest.fn();
  const updateJobData = jest.fn().mockResolvedValue(undefined);
  const logicFunctionTriggerJob = new LogicFunctionTriggerJob({
    execute: executeLogicFunction,
  } as never);

  beforeEach(() => {
    executeLogicFunction.mockReset();
    updateJobData.mockClear();
  });

  it('persists an application retry before failing the queue attempt', async () => {
    executeLogicFunction.mockResolvedValue({
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
      logicFunctionTriggerJob.handle(LOGIC_FUNCTION_JOB_DATA, {
        retryLimit: 10,
        updateData: updateJobData,
      }),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: 'Recall bot is not visible yet',
    });

    expect(executeLogicFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        context: { retryCount: 0, maxRetries: 3 },
      }),
    );
    expect(updateJobData).toHaveBeenCalledWith({
      ...LOGIC_FUNCTION_JOB_DATA,
      applicationRetryCount: 1,
    });
  });

  it('stops retrying after three application-requested retries', async () => {
    executeLogicFunction.mockResolvedValue({
      data: null,
      duration: 12,
      logs: '',
      status: LogicFunctionExecutionStatus.ERROR,
      error: {
        errorType: 'RetryableLogicFunctionError',
        errorMessage: 'Recall bot is still not visible',
        stackTrace: [],
      },
    });

    await expect(
      logicFunctionTriggerJob.handle(
        { ...LOGIC_FUNCTION_JOB_DATA, applicationRetryCount: 3 },
        {
          retryLimit: 10,
          updateData: updateJobData,
        },
      ),
    ).resolves.toBeUndefined();

    expect(executeLogicFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        context: { retryCount: 3, maxRetries: 3 },
      }),
    );
    expect(updateJobData).not.toHaveBeenCalled();
  });

  it('uses a smaller configured queue retry limit as the application maximum', async () => {
    executeLogicFunction.mockResolvedValue({
      data: null,
      duration: 12,
      logs: '',
      status: LogicFunctionExecutionStatus.ERROR,
      error: {
        errorType: 'RetryableLogicFunctionError',
        errorMessage: 'Dependency is unavailable',
        stackTrace: [],
      },
    });

    await expect(
      logicFunctionTriggerJob.handle(
        { ...LOGIC_FUNCTION_JOB_DATA, applicationRetryCount: 1 },
        {
          retryLimit: 1,
          updateData: updateJobData,
        },
      ),
    ).resolves.toBeUndefined();

    expect(executeLogicFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        context: { retryCount: 1, maxRetries: 1 },
      }),
    );
    expect(updateJobData).not.toHaveBeenCalled();
  });

  it('does not increment the application retry count for a platform failure', async () => {
    const platformExecutionError = new Error('Lambda invocation failed');

    executeLogicFunction.mockRejectedValue(platformExecutionError);

    await expect(
      logicFunctionTriggerJob.handle(
        { ...LOGIC_FUNCTION_JOB_DATA, applicationRetryCount: 1 },
        {
          retryLimit: 10,
          updateData: updateJobData,
        },
      ),
    ).rejects.toBe(platformExecutionError);

    expect(updateJobData).not.toHaveBeenCalled();
  });
});
