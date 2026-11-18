import { Test } from '@nestjs/testing';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LogicFunctionExecutionThrottleService } from 'src/engine/core-modules/logic-function/logic-function-execution-throttle/logic-function-execution-throttle.service';
import {
  LogicFunctionExecutionExceptionCode,
  LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const FLAT_APPLICATION = {
  id: 'application-id',
  workspaceId: 'workspace-id',
  universalIdentifier: 'application-universal-identifier',
} as FlatApplication;

const buildWorkspace = (
  activationStatus: WorkspaceActivationStatus,
): Pick<FlatWorkspace, 'activationStatus' | 'deletedAt'> => ({
  activationStatus,
  deletedAt: undefined,
});

const createExecutorService = async ({
  isApplicationStopped = false,
  workspace = buildWorkspace(WorkspaceActivationStatus.ACTIVE),
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
      {
        provide: WorkspaceCacheService,
        useValue: {
          getOrRecompute: jest.fn().mockResolvedValue({
            flatLogicFunctionMaps: {
              universalIdentifierById: {
                'logic-function-id': 'logic-function-universal-identifier',
              },
              byUniversalIdentifier: {
                'logic-function-universal-identifier': {
                  id: 'logic-function-id',
                  applicationId: FLAT_APPLICATION.id,
                  deletedAt: null,
                },
              },
            },
            flatApplicationMaps: {
              byId: { [FLAT_APPLICATION.id]: FLAT_APPLICATION },
            },
            flatApplicationVariableMaps: {},
          }),
        },
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

  it.each([
    ['suspended', buildWorkspace(WorkspaceActivationStatus.SUSPENDED)],
    ['inactive', buildWorkspace(WorkspaceActivationStatus.INACTIVE)],
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

  it('admits a run in an active workspace', async () => {
    const { logicFunctionExecutorService, consumeToken } =
      await createExecutorService();

    await expect(
      logicFunctionExecutorService.executeBuiltCode({
        workspaceId: 'workspace-id',
        flatApplication: FLAT_APPLICATION,
        getBuiltHandlerPath: jest.fn(),
        payload: {},
      }),
    ).rejects.toMatchObject({
      code: LogicFunctionExecutionExceptionCode.RATE_LIMIT_EXCEEDED,
    });

    expect(consumeToken).toHaveBeenCalledTimes(1);
    expect(consumeToken).toHaveBeenCalledWith('workspace-id');
  });
});

describe('LogicFunctionExecutorService.execute', () => {
  it('lets a lifecycle hook that skips usage limits run in a suspended workspace', async () => {
    const { logicFunctionExecutorService, consumeToken } =
      await createExecutorService({
        workspace: buildWorkspace(WorkspaceActivationStatus.SUSPENDED),
      });

    await expect(
      logicFunctionExecutorService.execute({
        logicFunctionId: 'logic-function-id',
        workspaceId: 'workspace-id',
        payload: {},
        shouldEnforceUsageLimits: false,
      }),
    ).rejects.toMatchObject({
      code: LogicFunctionExecutionExceptionCode.RATE_LIMIT_EXCEEDED,
    });

    expect(consumeToken).toHaveBeenCalledTimes(1);
    expect(consumeToken).toHaveBeenCalledWith('workspace-id');
  });
});
