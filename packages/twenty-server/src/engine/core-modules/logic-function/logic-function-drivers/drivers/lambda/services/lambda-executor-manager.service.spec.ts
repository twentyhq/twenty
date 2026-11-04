import {
  type FunctionConfiguration,
  type GetFunctionCommandOutput,
  UpdateFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { EXECUTOR_CONFIGURATION_TIMEOUT_IN_SECONDS } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaExecutorManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-executor-manager.service';
import { type LambdaLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-layer-manager.service';
import { type LambdaVpcConfig } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const VPC_CONFIG: LambdaVpcConfig = {
  subnetIds: ['subnet-a'],
  securityGroupIds: ['sg-a'],
};

const FLAT_LOGIC_FUNCTION = {
  id: 'function-id',
  workspaceId: 'workspace-id',
  runtime: 'nodejs22.x',
} as FlatLogicFunction;

const FLAT_APPLICATION = {
  id: 'application-id',
  isSdkLayerStale: false,
  sdkClientCoreChecksum: null,
} as FlatApplication;

const buildFunction = (
  configuration: FunctionConfiguration,
): GetFunctionCommandOutput => ({
  Configuration: {
    State: 'Active',
    LastUpdateStatus: 'Successful',
    ...configuration,
  },
  $metadata: {},
});

const OUTSIDE_VPC = buildFunction({});
const IN_VPC = buildFunction({
  VpcConfig: { SubnetIds: ['subnet-a'], SecurityGroupIds: ['sg-a'] },
});

const setup = (functionStates: GetFunctionCommandOutput[]) => {
  const remainingStates = [...functionStates];
  const send = jest.fn().mockResolvedValue({});
  const awsClient = {
    getFunction: jest.fn(async () =>
      remainingStates.length > 1 ? remainingStates.shift() : remainingStates[0],
    ),
    clearFunctionCache: jest.fn(),
    getLambdaClient: jest.fn(async () => ({ send })),
    waitFunctionActive: jest.fn(),
    waitFunctionUpdated: jest.fn(),
  };
  const layerManager = {
    hasExpectedLayers: jest.fn().mockResolvedValue(true),
    ensureDepsLayer: jest.fn().mockResolvedValue('deps-layer-arn'),
    ensureSdkLayer: jest.fn().mockResolvedValue('sdk-layer-arn'),
  };
  const cacheLockService = {
    withLock: jest.fn((callback: () => Promise<void>) => callback()),
  };
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatApplicationMaps: { byId: {} },
    }),
  };

  const executorManager = new LambdaExecutorManagerService(
    { lambdaRole: 'role-arn', vpcConfig: VPC_CONFIG },
    awsClient as unknown as LambdaAwsClientService,
    layerManager as unknown as LambdaLayerManagerService,
    cacheLockService as unknown as CacheLockService,
    {} as LogicFunctionResourceService,
    workspaceCacheService as unknown as WorkspaceCacheService,
  );

  const buildExecutor = () =>
    executorManager.buildExecutor({
      flatLogicFunction: FLAT_LOGIC_FUNCTION,
      flatApplication: FLAT_APPLICATION,
    });

  const sentConfigurationUpdates = () =>
    send.mock.calls
      .map(([command]) => command)
      .filter(
        (command) => command instanceof UpdateFunctionConfigurationCommand,
      );

  return { awsClient, send, buildExecutor, sentConfigurationUpdates };
};

describe('LambdaExecutorManagerService', () => {
  it('moves a function outside the VPC into it, waiting for the slow VPC setup', async () => {
    const { awsClient, buildExecutor, sentConfigurationUpdates } = setup([
      OUTSIDE_VPC,
    ]);

    await buildExecutor();

    expect(sentConfigurationUpdates()).toHaveLength(1);
    expect(sentConfigurationUpdates()[0].input.VpcConfig).toEqual({
      SubnetIds: ['subnet-a'],
      SecurityGroupIds: ['sg-a'],
    });
    expect(awsClient.waitFunctionUpdated).toHaveBeenCalledWith(
      FLAT_LOGIC_FUNCTION.id,
      EXECUTOR_CONFIGURATION_TIMEOUT_IN_SECONDS,
    );
  });

  it('waits for an update still running on AWS instead of sending another one', async () => {
    const { awsClient, buildExecutor, sentConfigurationUpdates } = setup([
      OUTSIDE_VPC,
      buildFunction({
        ...IN_VPC.Configuration,
        LastUpdateStatus: 'InProgress',
      }),
      IN_VPC,
    ]);

    await buildExecutor();

    expect(awsClient.waitFunctionUpdated).toHaveBeenCalledWith(
      FLAT_LOGIC_FUNCTION.id,
      EXECUTOR_CONFIGURATION_TIMEOUT_IN_SECONDS,
    );
    expect(sentConfigurationUpdates()).toHaveLength(0);
  });

  it('waits for a function still being created instead of updating it', async () => {
    const { awsClient, buildExecutor, sentConfigurationUpdates } = setup([
      OUTSIDE_VPC,
      buildFunction({ State: 'Pending' }),
      IN_VPC,
    ]);

    await buildExecutor();

    expect(awsClient.waitFunctionActive).toHaveBeenCalledWith(
      FLAT_LOGIC_FUNCTION.id,
      EXECUTOR_CONFIGURATION_TIMEOUT_IN_SECONDS,
    );
    expect(sentConfigurationUpdates()).toHaveLength(0);
  });

  it('forgets the cached function when an update fails, so the next run reads AWS again', async () => {
    const { awsClient, send, buildExecutor } = setup([OUTSIDE_VPC]);

    send.mockRejectedValue(new Error('update failed'));

    await expect(buildExecutor()).rejects.toThrow('update failed');

    const lastCacheClear = Math.max(
      ...awsClient.clearFunctionCache.mock.invocationCallOrder,
    );

    expect(lastCacheClear).toBeGreaterThan(send.mock.invocationCallOrder[0]);
  });
});
