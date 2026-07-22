import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

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

describe('LogicFunctionTriggerJob', () => {
  let job: LogicFunctionTriggerJob;
  let logicFunctionExecutorService: jest.Mocked<
    Pick<LogicFunctionExecutorService, 'execute'>
  >;

  beforeEach(() => {
    logicFunctionExecutorService = {
      execute: jest.fn().mockResolvedValue(buildExecuteResult()),
    };

    job = new LogicFunctionTriggerJob(
      logicFunctionExecutorService as unknown as LogicFunctionExecutorService,
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

  it('throws on a failed execution so the queue retries up to the trigger retryLimit', async () => {
    logicFunctionExecutorService.execute.mockResolvedValue(
      buildExecuteResult({ errorMessage: 'boom' }),
    );

    await expect(
      job.handle([{ logicFunctionId: 'fn-1', workspaceId: 'ws-1' }]),
    ).rejects.toThrow('Logic function fn-1 failed: boom');
  });
});
