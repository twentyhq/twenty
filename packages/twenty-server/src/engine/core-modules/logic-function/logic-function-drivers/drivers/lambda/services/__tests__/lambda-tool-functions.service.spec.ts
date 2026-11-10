import { CreateFunctionCommand, InvokeCommand } from '@aws-sdk/client-lambda';

import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-http-egress-handler-bundle.util',
  () => ({ buildHttpEgressHandlerBundle: async () => 'exports.handler = 1;' }),
);

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file',
  () => ({
    createZipFile: async (_sourceDirectory: string, outputPath: string) =>
      jest.requireActual('fs/promises').writeFile(outputPath, 'zip'),
  }),
);

jest.useRealTimers();

const HTTP_EGRESS_REQUEST = {
  input: { url: 'https://api.example.com', method: 'GET' as const },
  limits: { timeoutMs: 30_000, maxPayloadSizeBytes: 10 * 1024 * 1024 },
  context: { workspaceId: 'workspace-id', source: 'workflow-http' as const },
};

describe('LambdaToolFunctionsService.executeHttpRequest', () => {
  let managementSend: jest.Mock;
  let invokeSend: jest.Mock;
  let service: LambdaToolFunctionsService;

  beforeEach(() => {
    managementSend = jest.fn().mockResolvedValue({});
    invokeSend = jest.fn().mockResolvedValue({
      Payload: {
        transformToString: () =>
          JSON.stringify({
            toolOutput: { success: true, message: 'ok' },
            outcomeDetails: { outcome: 'success', durationMs: 1 },
          }),
      },
    });

    const awsClient = {
      getFunction: jest.fn().mockResolvedValue(undefined),
      getLambdaClient: async () => ({ send: managementSend }),
      waitFunctionActive: jest.fn(),
      clearFunctionCache: jest.fn(),
    } as unknown as LambdaAwsClientService;

    service = new LambdaToolFunctionsService(
      {
        lambdaRole: 'arn:aws:iam::123456789012:role/execution',
        resourceNamespace: 'namespace',
      },
      awsClient,
      {
        withLock: async (callback: () => Promise<void>) => callback(),
      } as unknown as CacheLockService,
      {
        getLambdaClient: async () => ({ send: invokeSend }),
      } as unknown as LambdaAwsClientService,
    );
  });

  it('creates the egress function without layers, on arm64', async () => {
    await service.executeHttpRequest(HTTP_EGRESS_REQUEST);

    const createCommand = managementSend.mock.calls
      .map(([command]) => command)
      .find((command) => command instanceof CreateFunctionCommand);

    expect(createCommand?.input).toMatchObject({
      FunctionName: expect.stringMatching(/^twenty-http-egress/),
      Layers: [],
      Architectures: ['arm64'],
      MemorySize: 512,
      Timeout: 35,
      Role: 'arn:aws:iam::123456789012:role/execution',
    });
  });

  it('invokes through the client that never retries, with the Lambda payload cap', async () => {
    const response = await service.executeHttpRequest(HTTP_EGRESS_REQUEST);

    expect(response.toolOutput).toEqual({ success: true, message: 'ok' });
    expect(managementSend).not.toHaveBeenCalledWith(
      expect.any(InvokeCommand),
      expect.anything(),
    );

    const [invokeCommand] = invokeSend.mock.calls[0];

    expect(JSON.parse(invokeCommand.input.Payload).limits).toEqual({
      timeoutMs: 30_000,
      maxPayloadSizeBytes: 4 * 1024 * 1024,
    });
  });
});
