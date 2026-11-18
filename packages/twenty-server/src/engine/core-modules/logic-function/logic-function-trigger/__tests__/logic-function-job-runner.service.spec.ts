import { Test } from '@nestjs/testing';

import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  LogicFunctionJobRunnerService,
  type LogicFunctionJobPayload,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

const LOGIC_FUNCTION_PAYLOAD: LogicFunctionJobPayload = {
  logicFunctionId: 'logic-function-id',
  workspaceId: 'workspace-id',
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
  it('skips a run refused because its workspace is suspended', async () => {
    const jobRunnerService = await createJobRunnerService(
      jest
        .fn()
        .mockRejectedValue(
          new LogicFunctionException(
            'Workspace workspace-id is suspended or deleted',
            LogicFunctionExceptionCode.LOGIC_FUNCTION_WORKSPACE_SUSPENDED,
          ),
        ),
    );
    const persistRetryCount = jest.fn();

    await expect(
      jobRunnerService.run({
        logicFunctionPayload: LOGIC_FUNCTION_PAYLOAD,
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
