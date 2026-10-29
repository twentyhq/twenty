import {
  GetFunctionCommand,
  InvokeCommand,
  Lambda,
  type State,
  UpdateFunctionConfigurationCommand,
  waitUntilFunctionActiveV2,
} from '@aws-sdk/client-lambda';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { LambdaDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda.driver';
import { LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { type LambdaDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
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
  let commands: string[];
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
    const cacheStorageService = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
      acquireLock: async () => {
        if (isLocked) return undefined;
        isLocked = true;
        return 'owner';
      },
      releaseLock: async () => {
        isLocked = false;
      },
      extendLock: async () => true,
    } as unknown as CacheStorageService;

    const send = jest.spyOn(
      client as {
        send(
          command:
            | GetFunctionCommand
            | UpdateFunctionConfigurationCommand
            | InvokeCommand,
        ): Promise<unknown>;
      },
      'send',
    );

    send.mockImplementation(async (command) => {
      commands.push(command.constructor.name);
      if (command instanceof GetFunctionCommand) {
        const response = { Configuration: { State: state }, $metadata: {} };
        if (state === 'Pending') state = 'Active';
        return response;
      }
      if (command instanceof UpdateFunctionConfigurationCommand) {
        if (updateError) throw updateError;
        state = 'Pending';
        return { State: state, $metadata: {} };
      }
      if (command instanceof InvokeCommand) {
        expect(state).toBe('Active');
        const payload = JSON.parse(String(command.input.Payload));
        payloads.push(payload);
        functionNames.push(command.input.FunctionName);
        return {
          Payload: {
            transformToString: () =>
              JSON.stringify(
                payload.sourceCode
                  ? { builtCode: 'export const handler = () => 1;' }
                  : RESULT,
              ),
          },
          $metadata: {},
        };
      }
      throw new Error('Unexpected Lambda command');
    });
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
      cacheStorageService,
      cacheLockService: new CacheLockService(cacheStorageService),
    } as LambdaDriverOptions);
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
