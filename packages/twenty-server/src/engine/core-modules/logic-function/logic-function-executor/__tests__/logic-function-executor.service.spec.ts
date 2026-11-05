import { Test } from '@nestjs/testing';

import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';

const FLAT_APPLICATION = {
  id: 'application-id',
  workspaceId: 'workspace-id',
  universalIdentifier: 'application-universal-identifier',
} as FlatApplication;

describe('LogicFunctionExecutorService.executeBuiltCode', () => {
  it('rejects a run of a stopped application without building its code', async () => {
    const testingModule = await Test.createTestingModule({
      providers: [
        LogicFunctionExecutorService,
        {
          provide: ApplicationStopService,
          useValue: { isApplicationStopped: jest.fn().mockResolvedValue(true) },
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    const getBuiltHandlerPath = jest.fn();

    await expect(
      testingModule.get(LogicFunctionExecutorService).executeBuiltCode({
        workspaceId: 'workspace-id',
        flatApplication: FLAT_APPLICATION,
        getBuiltHandlerPath,
        payload: {},
      }),
    ).rejects.toMatchObject({
      code: LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
    });

    expect(getBuiltHandlerPath).not.toHaveBeenCalled();
  });
});
