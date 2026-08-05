import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

describe('LogicFunctionTriggerJob', () => {
  let execute: jest.Mock;
  let job: LogicFunctionTriggerJob;

  const jobData = {
    logicFunctionId: 'function-id',
    workspaceId: 'workspace-id',
  };

  beforeEach(() => {
    execute = jest.fn();
    job = new LogicFunctionTriggerJob({
      execute,
    } as unknown as LogicFunctionExecutorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should execute each payload', async () => {
    await job.handle([jobData, { ...jobData, logicFunctionId: 'other-id' }]);

    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('should not fail the job when the function is disabled', async () => {
    execute.mockRejectedValue(
      new LogicFunctionException(
        'disabled',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
      ),
    );

    await expect(job.handle(jobData)).resolves.toBeUndefined();
  });

  it('should not fail the job when the dependencies size is exceeded', async () => {
    execute.mockRejectedValue(
      new LogicFunctionException(
        'Dependencies size exceeded',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
      ),
    );

    await expect(job.handle(jobData)).resolves.toBeUndefined();
  });

  it('should rethrow any other failure so the queue retries', async () => {
    execute.mockRejectedValue(
      new LogicFunctionException(
        'layer build failed',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_LAYER_BUILD_FAILED,
      ),
    );

    await expect(job.handle(jobData)).rejects.toThrow('layer build failed');
  });
});
