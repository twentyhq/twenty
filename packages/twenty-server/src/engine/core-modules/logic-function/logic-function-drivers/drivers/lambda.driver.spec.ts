import {
  Lambda,
  type State,
  waitUntilFunctionActiveV2,
} from '@aws-sdk/client-lambda';
import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { LambdaDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda.driver';
import { LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-builder-name.util',
  () => ({ getFrontComponentBuilderName: async () => 'workspace-builder' }),
);

jest.useRealTimers();

const REQUEST = {
  targetRuntime: 'browser' as const,
  workspaceId: 'workspace',
  packageJson: '{"name":"fixture","private":true}',
  yarnLock: '# fixture lockfile',
};
const RESULT = {
  success: false,
  code: 'BUILD_FAILED',
  error: 'Build diagnostic',
};

describe('LambdaDriver', () => {
  let state: State;
  let updateError: Error | undefined;
  let commands: (string | undefined)[];
  let payloads: unknown[];
  let functionNames: unknown[];
  let driver: LambdaDriver;
  let client: Lambda;

  beforeEach(() => {
    state = 'Inactive';
    updateError = undefined;
    commands = [];
    payloads = [];
    functionNames = [];
    client = new Lambda({ region: 'eu-west-1' });
    let isLocked = false;
    const cacheStorageService = jest.createMockFromModule<
      typeof import('src/engine/core-modules/cache-storage/services/cache-storage.service')
    >('src/engine/core-modules/cache-storage/services/cache-storage.service')
      .CacheStorageService.prototype;
    jest
      .spyOn(cacheStorageService, 'acquireLock')
      .mockImplementation(async () => {
        if (isLocked) {
          return null;
        }
        isLocked = true;
        return 'owner';
      });
    jest
      .spyOn(cacheStorageService, 'releaseLock')
      .mockImplementation(async () => {
        isLocked = false;
      });
    jest.spyOn(cacheStorageService, 'extendLock').mockResolvedValue(true);

    client.middlewareStack.add(
      (_next, context) =>
        async ({ input }) => {
          const commandName = context.commandName;
          commands.push(commandName);
          if (commandName === 'GetFunctionCommand') {
            const output = { Configuration: { State: state }, $metadata: {} };
            if (state === 'Pending') {
              state = 'Active';
            }
            return { response: {}, output };
          }
          if (commandName === 'UpdateFunctionConfigurationCommand') {
            if (isDefined(updateError)) {
              throw updateError;
            }
            state = 'Pending';
            return { response: {}, output: { State: state, $metadata: {} } };
          }
          if (commandName === 'InvokeCommand' && 'Payload' in input) {
            expect(state).toBe('Active');
            const payload = JSON.parse(String(input.Payload));
            payloads.push(payload);
            functionNames.push(input.FunctionName);
            const response = JSON.stringify(
              payload.sourceCode
                ? { builtCode: 'export const handler = () => 1;' }
                : RESULT,
            );
            return {
              response: {},
              output: {
                Payload: Object.assign(Buffer.from(response), {
                  transformToString: () => response,
                }),
                $metadata: {},
              },
            };
          }
          throw new Error('Unexpected Lambda command');
        },
      { step: 'initialize' },
    );
    jest
      .spyOn(LambdaAwsClientService.prototype, 'getLambdaClient')
      .mockResolvedValue(client);
    jest
      .spyOn(LambdaAwsClientService.prototype, 'waitFunctionActive')
      .mockImplementation(async (functionName) => {
        await waitUntilFunctionActiveV2(
          { client, maxWaitTime: 1, minDelay: 0.01, maxDelay: 0.01 },
          { FunctionName: functionName },
        );
      });
    driver = new LambdaDriver({
      region: 'eu-west-1',
      layerBucket: 'fixture',
      layerBucketRegion: 'eu-west-1',
      resourceNamespace: 'fixture',
      lambdaRole: 'fixture',
      logicFunctionResourceService: jest.createMockFromModule<
        typeof import('src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service')
      >(
        'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service',
      ).LogicFunctionResourceService.prototype,
      sdkClientArchiveService: jest.createMockFromModule<
        typeof import('src/engine/core-modules/sdk-client/sdk-client-archive.service')
      >('src/engine/core-modules/sdk-client/sdk-client-archive.service')
        .SdkClientArchiveService.prototype,
      workspaceCacheService: jest.createMockFromModule<
        typeof import('src/engine/workspace-cache/services/workspace-cache.service')
      >('src/engine/workspace-cache/services/workspace-cache.service')
        .WorkspaceCacheService.prototype,
      coreEntityCacheService: jest.createMockFromModule<
        typeof import('src/engine/core-entity-cache/services/core-entity-cache.service')
      >('src/engine/core-entity-cache/services/core-entity-cache.service')
        .CoreEntityCacheService.prototype,
      applicationDependencyFilesService: jest.createMockFromModule<
        typeof import('src/engine/core-modules/application/application-package/application-dependency-files.service')
      >(
        'src/engine/core-modules/application/application-package/application-dependency-files.service',
      ).ApplicationDependencyFilesService.prototype,
      cacheStorageService,
      cacheLockService: new CacheLockService(cacheStorageService),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    client.destroy();
  });

  it.each([LogicFunctionRuntime.NODE18, LogicFunctionRuntime.NODE22])(
    'selects the Node builder for %s and the browser builder on the same driver',
    async (targetRuntime) => {
      const request = {
        targetRuntime,
        sourceCode: 'export const handler = () => 1;',
        sourceFileName: 'handler.ts',
        builtFileName: 'handler.mjs',
      };
      await expect(driver.transpile(request)).resolves.toEqual({
        builtCode: 'export const handler = () => 1;',
      });
      await expect(driver.buildDependencies(REQUEST)).resolves.toEqual(RESULT);
      expect(payloads[0]).toEqual({ ...request, action: 'transpile' });
      expect(functionNames[0]).not.toBe('workspace-builder');
      expect(functionNames[1]).toBe('workspace-builder');
    },
  );

  it('reactivates an idle builder before sending the build exactly once', async () => {
    await expect(driver.buildDependencies(REQUEST)).resolves.toEqual(RESULT);

    expect(
      commands.filter(
        (command) => command === 'UpdateFunctionConfigurationCommand',
      ),
    ).toHaveLength(1);
    expect(payloads).toEqual([
      {
        action: 'buildDependencies',
        packageJson: REQUEST.packageJson,
        yarnLock: REQUEST.yarnLock,
      },
    ]);
  });

  it('reactivates once for concurrent builds', async () => {
    await Promise.all([
      driver.buildDependencies(REQUEST),
      driver.buildDependencies(REQUEST),
    ]);

    expect(
      commands.filter(
        (command) => command === 'UpdateFunctionConfigurationCommand',
      ),
    ).toHaveLength(1);
    expect(payloads).toHaveLength(2);
  });

  it.each(['Active', 'Pending'] as const)(
    'reuses a %s builder without updating it',
    async (initialState) => {
      state = initialState;

      await expect(driver.buildDependencies(REQUEST)).resolves.toEqual(RESULT);
      expect(commands).not.toContain('UpdateFunctionConfigurationCommand');
      expect(payloads).toHaveLength(1);
    },
  );

  it('does not invoke a builder whose reactivation failed', async () => {
    updateError = new Error('Access denied');

    await expect(driver.buildDependencies(REQUEST)).rejects.toBe(updateError);
    expect(payloads).toHaveLength(0);
  });

  it('does not invoke or update a failed builder', async () => {
    state = 'Failed';

    await expect(driver.buildDependencies(REQUEST)).rejects.toThrow();
    expect(commands).not.toContain('UpdateFunctionConfigurationCommand');
    expect(payloads).toHaveLength(0);
  });
});
