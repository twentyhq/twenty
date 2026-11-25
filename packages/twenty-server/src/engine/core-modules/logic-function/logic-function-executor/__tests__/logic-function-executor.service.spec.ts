import { Test } from '@nestjs/testing';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LogicFunctionExecutionThrottleService } from 'src/engine/core-modules/logic-function/logic-function-execution-throttle/logic-function-execution-throttle.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';

const FLAT_APPLICATION = {
  id: 'application-id',
  workspaceId: 'workspace-id',
  universalIdentifier: 'application-universal-identifier',
} as FlatApplication;

const createExecutorService = async ({
  isApplicationStopped = false,
  workspace = null,
}: {
  isApplicationStopped?: boolean;
  workspace?: Pick<FlatWorkspace, 'activationStatus' | 'deletedAt'> | null;
} = {}) => {
  const consumeToken = jest.fn().mockResolvedValue(false);

  const testingModule = await Test.createTestingModule({
    providers: [
      LogicFunctionExecutorService,
      {
        provide: ApplicationStopService,
        useValue: {
          isApplicationStopped: jest
            .fn()
            .mockResolvedValue(isApplicationStopped),
        },
      },
      {
        provide: CoreEntityCacheService,
        useValue: { get: jest.fn().mockResolvedValue(workspace) },
      },
      {
        provide: LogicFunctionExecutionThrottleService,
        useValue: { consumeToken },
      },
    ],
  })
    .useMocker(() => ({}))
    .compile();

  return {
    logicFunctionExecutorService: testingModule.get(
      LogicFunctionExecutorService,
    ),
    consumeToken,
  };
};

describe('LogicFunctionExecutorService.executeBuiltCode', () => {
  it('rejects a run of a stopped application without building its code', async () => {
    const { logicFunctionExecutorService } = await createExecutorService({
      isApplicationStopped: true,
    });

    const getBuiltHandlerPath = jest.fn();

    await expect(
      logicFunctionExecutorService.executeBuiltCode({
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

  // Deleted workspaces and throttle ordering can't be observed on the shared integration seed workspaces.
  it.each([
    [
      'suspended',
      {
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
        deletedAt: undefined,
      },
    ],
    [
      'inactive',
      {
        activationStatus: WorkspaceActivationStatus.INACTIVE,
        deletedAt: undefined,
      },
    ],
    ['deleted', null],
  ])(
    'rejects a run in a %s workspace before spending a throttle token',
    async (_, workspace) => {
      const { logicFunctionExecutorService, consumeToken } =
        await createExecutorService({ workspace });

      const getBuiltHandlerPath = jest.fn();

      await expect(
        logicFunctionExecutorService.executeBuiltCode({
          workspaceId: 'workspace-id',
          flatApplication: FLAT_APPLICATION,
          getBuiltHandlerPath,
          payload: {},
        }),
      ).rejects.toMatchObject({
        code: LogicFunctionExceptionCode.LOGIC_FUNCTION_WORKSPACE_SUSPENDED,
      });

      expect(consumeToken).not.toHaveBeenCalled();
      expect(getBuiltHandlerPath).not.toHaveBeenCalled();
    },
  );
});
