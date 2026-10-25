import { CreateFunctionCommand } from '@aws-sdk/client-lambda';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { LAMBDA_SDK_CLIENT_CHECKSUM_TAG } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaExecutorManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-executor-manager.service';
import { type LambdaLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-layer-manager.service';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-executor',
);
jest.mock(
  'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file',
  () => ({
    createZipFile: jest.fn(
      async (_sourceDirectory: string, zipPath: string) => {
        const fileSystem: typeof import('fs/promises') =
          jest.requireActual('fs/promises');

        await fileSystem.writeFile(zipPath, 'executor');
      },
    ),
  }),
);

describe('Lambda executor resource tags', () => {
  it.each<{
    resourceTags: Record<string, string> | undefined;
    checksum: string | null;
    expected: Record<string, string> | undefined;
  }>([
    {
      resourceTags: {
        Environment: 'production',
        [LAMBDA_SDK_CLIENT_CHECKSUM_TAG]: 'configured-checksum',
      },
      checksum: 'current-sdk',
      expected: {
        Environment: 'production',
        [LAMBDA_SDK_CLIENT_CHECKSUM_TAG]: 'current-sdk',
      },
    },
    {
      resourceTags: undefined,
      checksum: 'current-sdk',
      expected: { [LAMBDA_SDK_CLIENT_CHECKSUM_TAG]: 'current-sdk' },
    },
    {
      resourceTags: { Environment: 'production' },
      checksum: null,
      expected: { Environment: 'production' },
    },
    { resourceTags: undefined, checksum: null, expected: undefined },
  ])(
    'preserves the SDK checksum and optional deployment tags: $checksum',
    async ({ resourceTags, checksum, expected }) => {
      const send = jest.fn().mockResolvedValue({});
      const flatApplication = {
        id: 'application',
        sdkClientCoreChecksum: checksum,
      } as FlatApplication;
      const service = new LambdaExecutorManagerService(
        { lambdaRole: 'arn:aws:iam::123456789012:role/executor', resourceTags },
        {
          getFunction: jest.fn().mockResolvedValue(undefined),
          clearFunctionCache: jest.fn().mockResolvedValue(undefined),
          getLambdaClient: jest.fn().mockResolvedValue({ send }),
          waitFunctionActive: jest.fn().mockResolvedValue(undefined),
        } as unknown as LambdaAwsClientService,
        {
          ensureDepsLayer: jest.fn().mockResolvedValue('deps-layer'),
          ensureSdkLayer: jest.fn().mockResolvedValue('sdk-layer'),
        } as unknown as LambdaLayerManagerService,
        {
          withLock: jest.fn((callback: () => Promise<void>) => callback()),
        } as unknown as CacheLockService,
        {} as LogicFunctionResourceService,
        {
          getOrRecompute: jest.fn().mockResolvedValue({
            flatApplicationMaps: { byId: { application: flatApplication } },
          }),
        } as unknown as WorkspaceCacheService,
      );

      await service.buildExecutor({
        flatLogicFunction: {
          id: 'function',
          workspaceId: 'workspace',
          runtime: LogicFunctionRuntime.NODE22,
        } as FlatLogicFunction,
        flatApplication,
        applicationUniversalIdentifier: 'application-universal-identifier',
      });

      const command = send.mock.calls[0][0];

      expect(command).toBeInstanceOf(CreateFunctionCommand);
      expect(command.input.Tags).toEqual(expected);
    },
  );
});
