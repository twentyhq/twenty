import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { UserApplicationVariableValueService } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.service';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LogicFunctionExecutionThrottleService } from 'src/engine/core-modules/logic-function/logic-function-execution-throttle/logic-function-execution-throttle.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageQuotaAdmissionService } from 'src/engine/core-modules/usage-limit/services/usage-quota-admission.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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

describe('LogicFunctionExecutorService.warmUp', () => {
  const createWarmUpExecutorService = async ({
    isApplicationStopped = false,
    driverWarmUp = jest.fn().mockResolvedValue(undefined),
    assertUsageAllowed = jest.fn().mockResolvedValue(undefined),
  }: {
    isApplicationStopped?: boolean;
    driverWarmUp?: jest.Mock;
    assertUsageAllowed?: jest.Mock;
  } = {}) => {
    const charge = jest.fn().mockResolvedValue(undefined);

    const flatLogicFunction = {
      id: 'logic-function-id',
      applicationId: FLAT_APPLICATION.id,
      deletedAt: null,
    };

    const testingModule = await Test.createTestingModule({
      providers: [
        LogicFunctionExecutorService,
        {
          provide: LogicFunctionDriverFactory,
          useValue: { getCurrentDriver: () => ({ warmUp: driverWarmUp }) },
        },
        {
          provide: ApplicationStopService,
          useValue: {
            isApplicationStopped: jest
              .fn()
              .mockResolvedValue(isApplicationStopped),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockResolvedValue({
              flatLogicFunctionMaps: {
                byUniversalIdentifier: {
                  'logic-function-universal-identifier': flatLogicFunction,
                },
                universalIdentifierById: {
                  [flatLogicFunction.id]: 'logic-function-universal-identifier',
                },
              },
              flatApplicationMaps: {
                byId: { [FLAT_APPLICATION.id]: FLAT_APPLICATION },
              },
              flatApplicationVariableMaps: {},
            }),
          },
        },
        {
          provide: ApplicationTokenService,
          useValue: {
            generateApplicationAccessToken: jest
              .fn()
              .mockResolvedValue({ token: 'application-access-token' }),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue('https://twenty.test') },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: { findOne: jest.fn().mockResolvedValue(null) },
        },
        {
          provide: ApplicationRegistrationVariableService,
          useValue: { getServerEnvVariables: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: ApplicationVariableEntityService,
          useValue: {
            getServerEnvVariables: jest
              .fn()
              .mockResolvedValue({ MY_VARIABLE: 'value' }),
          },
        },
        {
          provide: UserApplicationVariableValueService,
          useValue: { getServerEnvVariables: jest.fn().mockResolvedValue({}) },
        },
        { provide: UsageLimitQuotaService, useValue: { charge } },
        {
          provide: UsageQuotaAdmissionService,
          useValue: { assertUsageAllowed },
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    return {
      logicFunctionExecutorService: testingModule.get(
        LogicFunctionExecutorService,
      ),
      flatLogicFunction,
      driverWarmUp,
      charge,
    };
  };

  it('warms the function up with the variables a real execution would get', async () => {
    const { logicFunctionExecutorService, flatLogicFunction, driverWarmUp } =
      await createWarmUpExecutorService();

    await logicFunctionExecutorService.warmUp({
      workspaceId: 'workspace-id',
      logicFunctionId: 'logic-function-id',
    });

    expect(driverWarmUp).toHaveBeenCalledWith({
      flatLogicFunction,
      env: expect.objectContaining({
        MY_VARIABLE: 'value',
        APPLICATION_ID: FLAT_APPLICATION.id,
      }),
    });
  });

  it('does not warm up a function of a stopped application', async () => {
    const { logicFunctionExecutorService, driverWarmUp } =
      await createWarmUpExecutorService({ isApplicationStopped: true });

    await logicFunctionExecutorService.warmUp({
      workspaceId: 'workspace-id',
      logicFunctionId: 'logic-function-id',
    });

    expect(driverWarmUp).not.toHaveBeenCalled();
  });

  it('does not fail when the warm-up itself fails', async () => {
    const { logicFunctionExecutorService } = await createWarmUpExecutorService({
      driverWarmUp: jest.fn().mockRejectedValue(new Error('Lambda down')),
    });

    await expect(
      logicFunctionExecutorService.warmUp({
        workspaceId: 'workspace-id',
        logicFunctionId: 'logic-function-id',
      }),
    ).resolves.toBeUndefined();
  });

  it('does not charge the install-time warm-up', async () => {
    const { logicFunctionExecutorService, charge } =
      await createWarmUpExecutorService();

    await logicFunctionExecutorService.warmUp({
      workspaceId: 'workspace-id',
      logicFunctionId: 'logic-function-id',
    });

    expect(charge).not.toHaveBeenCalled();
  });

  describe('keepWarm', () => {
    it('charges each keep-warm ping as a normal execution', async () => {
      const { logicFunctionExecutorService, driverWarmUp, charge } =
        await createWarmUpExecutorService();

      await logicFunctionExecutorService.keepWarm({
        workspaceId: 'workspace-id',
        logicFunctionId: 'logic-function-id',
      });

      expect(driverWarmUp).toHaveBeenCalledTimes(1);
      expect(charge).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        events: [
          expect.objectContaining({
            operationType: UsageOperationType.CODE_KEEP_WARM,
            unit: UsageUnit.INVOCATION,
            creditsUsedMicro: 100,
            resourceId: 'logic-function-id',
          }),
          expect.objectContaining({
            operationType: UsageOperationType.CODE_KEEP_WARM,
            unit: UsageUnit.MILLISECOND,
          }),
        ],
      });
    });

    it('neither pings nor charges a workspace that is out of credits', async () => {
      const { logicFunctionExecutorService, driverWarmUp, charge } =
        await createWarmUpExecutorService({
          assertUsageAllowed: jest
            .fn()
            .mockRejectedValue(new Error('Credits exhausted')),
        });

      await expect(
        logicFunctionExecutorService.keepWarm({
          workspaceId: 'workspace-id',
          logicFunctionId: 'logic-function-id',
        }),
      ).resolves.toBeUndefined();

      expect(driverWarmUp).not.toHaveBeenCalled();
      expect(charge).not.toHaveBeenCalled();
    });
  });
});
