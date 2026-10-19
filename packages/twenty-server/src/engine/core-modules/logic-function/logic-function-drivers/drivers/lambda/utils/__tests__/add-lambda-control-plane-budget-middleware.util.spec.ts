import {
  GetFunctionCommand,
  InvokeCommand,
  Lambda,
  TagResourceCommand,
} from '@aws-sdk/client-lambda';

import { addLambdaControlPlaneBudgetMiddleware } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/add-lambda-control-plane-budget-middleware.util';

const buildLambdaClient = ({
  maxAttempts = 1,
  respond = async () => ({ output: { $metadata: {} }, response: {} }),
}: {
  maxAttempts?: number;
  respond?: () => Promise<{ output: { $metadata: object }; response: object }>;
} = {}) => {
  const lambdaClient = new Lambda({
    region: 'eu-central-1',
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
    maxAttempts,
    retryMode: 'standard',
  });
  const waitForRequestSlot = jest.fn().mockResolvedValue(undefined);

  addLambdaControlPlaneBudgetMiddleware({ lambdaClient, waitForRequestSlot });

  // Outermost deserialize middleware: answers before any network call.
  lambdaClient.middlewareStack.add(() => respond, {
    step: 'deserialize',
    priority: 'high',
    name: 'stubTransportMiddleware',
  });

  return { lambdaClient, waitForRequestSlot };
};

const TAG_RESOURCE_COMMAND = new TagResourceCommand({
  Resource: 'arn:aws:lambda:eu-central-1:123456789012:function:test',
  Tags: { checksum: 'abc' },
});

describe('addLambdaControlPlaneBudgetMiddleware', () => {
  it('waits for a budget slot before a control-plane request', async () => {
    const { lambdaClient, waitForRequestSlot } = buildLambdaClient();

    await lambdaClient.send(TAG_RESOURCE_COMMAND);

    expect(waitForRequestSlot).toHaveBeenCalledTimes(1);
  });

  it('does not budget Invoke and GetFunction, which have their own quotas', async () => {
    const { lambdaClient, waitForRequestSlot } = buildLambdaClient();

    await lambdaClient.send(new InvokeCommand({ FunctionName: 'test' }));
    await lambdaClient.send(new GetFunctionCommand({ FunctionName: 'test' }));

    expect(waitForRequestSlot).not.toHaveBeenCalled();
  });

  it('spends a slot on every retry attempt', async () => {
    const { lambdaClient, waitForRequestSlot } = buildLambdaClient({
      maxAttempts: 2,
      respond: async () => {
        throw Object.assign(new Error('Rate exceeded'), {
          name: 'TooManyRequestsException',
          $metadata: { httpStatusCode: 429 },
        });
      },
    });

    const sendAssertion = expect(
      lambdaClient.send(TAG_RESOURCE_COMMAND),
    ).rejects.toThrow('Rate exceeded');

    await jest.runAllTimersAsync();
    await sendAssertion;

    expect(waitForRequestSlot).toHaveBeenCalledTimes(2);
  });
});
