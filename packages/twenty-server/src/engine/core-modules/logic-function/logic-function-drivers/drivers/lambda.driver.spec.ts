import { PageLayoutType } from 'twenty-shared/types';
import { FRONT_COMPONENT_BUILDER_MAX_PAYLOAD_BYTES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-builder-max-payload-bytes.constant';
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
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-builder-name.util',
  () => ({ getFrontComponentBuilderName: async () => 'workspace-builder' }),
);

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-http-egress-handler-bundle.util',
  () => ({ buildHttpEgressHandlerBundle: async () => 'exports.handler = 1;' }),
);

jest.useRealTimers();

const HTTP_EGRESS_REQUEST = {
  input: { url: 'https://api.example.com/items', method: 'GET' as const },
  limits: { timeoutMs: 30_000, maxPayloadSizeBytes: 10 * 1024 * 1024 },
  context: {
    workspaceId: 'workspace-id',
    source: 'workflow-http-test' as const,
    userId: 'user-id',
  },
};

const HTTP_EGRESS_RESPONSE = {
  status: 200,
  statusText: 'OK',
  headers: {},
  body: { ok: true },
  outcomeDetails: { outcome: 'success', status: 200, durationMs: 12 },
};

// What the client's rate-limit middleware turns a TooManyRequestsException into.
const buildRateLimitedError = () =>
  new LogicFunctionException(
    'Lambda rate limited InvokeCommand',
    LogicFunctionExceptionCode.LOGIC_FUNCTION_RATE_LIMITED,
  );

const buildInvokePayload = (body: string) =>
  Object.assign(Buffer.from(body), { transformToString: () => body });

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
  let egressInvokeOutput: { Payload?: unknown; FunctionError?: string };
  let egressInvokeErrors: Error[];

  beforeEach(() => {
    state = 'Inactive';
    updateError = undefined;
    commands = [];
    payloads = [];
    functionNames = [];
    egressInvokeOutput = {
      Payload: buildInvokePayload(JSON.stringify(HTTP_EGRESS_RESPONSE)),
    };
    egressInvokeErrors = [];
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

            if (isDefined(payload.context)) {
              const egressInvokeError = egressInvokeErrors.shift();

              if (isDefined(egressInvokeError)) {
                throw egressInvokeError;
              }

              return {
                response: {},
                output: { ...egressInvokeOutput, $metadata: {} },
              };
            }
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

  it('rejects oversized browser requests before provisioning or invoking Lambda', async () => {
    await expect(
      driver.transpile({
        targetRuntime: 'browser',
        workspaceId: 'workspace',
        typeReferences: 'x'.repeat(FRONT_COMPONENT_BUILDER_MAX_PAYLOAD_BYTES),
        manifest: { checksum: 'a'.repeat(64), exports: {} },
        input: {
          componentId: 'component',
          name: 'Component',
          pageLayoutType: PageLayoutType.DASHBOARD,
          source: 'export const Component = () => <div />;',
        },
      }),
    ).rejects.toThrow('request exceeds the 6 MiB limit');
    expect(commands).toEqual([]);
  });

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
  describe('executeHttpRequest', () => {
    beforeEach(() => {
      state = 'Active';
    });

    it('runs the request in the egress Lambda', async () => {
      const output = await driver.executeHttpRequest(HTTP_EGRESS_REQUEST);

      expect(output).toEqual(HTTP_EGRESS_RESPONSE);
      expect(String(functionNames[0])).toMatch(/^twenty-http-egress/);
      expect(payloads[0]).toEqual({
        ...HTTP_EGRESS_REQUEST,
        limits: { timeoutMs: 30_000, maxPayloadSizeBytes: 4 * 1024 * 1024 },
      });
    });

    it('reports an unavailable egress without retrying the invoke', async () => {
      egressInvokeErrors = [new Error('Service unavailable')];

      const output = await driver.executeHttpRequest(HTTP_EGRESS_REQUEST);

      expect(output).toMatchObject({
        errorMessage:
          'Outbound HTTP requests are temporarily unavailable. Try again later.',
        outcomeDetails: {
          outcome: 'other-error',
          errorCode: 'EGRESS_UNAVAILABLE',
        },
      });
      expect(
        commands.filter((command) => command === 'InvokeCommand'),
      ).toHaveLength(1);
    });

    it('retries an invoke that Lambda rate limited, since it never ran', async () => {
      egressInvokeErrors = [buildRateLimitedError()];

      const output = await driver.executeHttpRequest(HTTP_EGRESS_REQUEST);

      expect(output).toEqual(HTTP_EGRESS_RESPONSE);
      expect(
        commands.filter((command) => command === 'InvokeCommand'),
      ).toHaveLength(2);
    });

    it('reports unavailable once rate-limited retries run out', async () => {
      egressInvokeErrors = [
        buildRateLimitedError(),
        buildRateLimitedError(),
        buildRateLimitedError(),
      ];

      const output = await driver.executeHttpRequest(HTTP_EGRESS_REQUEST);

      expect(output).toMatchObject({
        outcomeDetails: { errorCode: 'EGRESS_UNAVAILABLE' },
      });
      expect(
        commands.filter((command) => command === 'InvokeCommand'),
      ).toHaveLength(3);
    });

    it('reports a stalled invoke as unavailable rather than a request timeout', async () => {
      egressInvokeErrors = [
        Object.assign(new Error('The operation was aborted due to timeout'), {
          name: 'TimeoutError',
        }),
      ];

      const output = await driver.executeHttpRequest(HTTP_EGRESS_REQUEST);

      expect(output).toMatchObject({
        errorMessage:
          'Outbound HTTP requests are temporarily unavailable. Try again later.',
        outcomeDetails: { errorCode: 'EGRESS_UNAVAILABLE' },
      });
    });

    it('reports a Lambda timeout as a request timeout', async () => {
      egressInvokeOutput = {
        FunctionError: 'Unhandled',
        Payload: buildInvokePayload(
          JSON.stringify({
            errorType: 'Sandbox.Timedout',
            errorMessage: 'Task timed out after 35.00 seconds',
          }),
        ),
      };

      const output = await driver.executeHttpRequest(HTTP_EGRESS_REQUEST);

      expect(output).toMatchObject({
        errorMessage: 'Request timed out after 30s',
        outcomeDetails: { outcome: 'timeout' },
      });
    });
  });
});
