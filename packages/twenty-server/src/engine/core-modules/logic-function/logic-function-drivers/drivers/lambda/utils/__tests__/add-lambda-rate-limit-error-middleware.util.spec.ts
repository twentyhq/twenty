import { Lambda, TagResourceCommand } from '@aws-sdk/client-lambda';

import { addLambdaRateLimitErrorMiddleware } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/add-lambda-rate-limit-error-middleware.util';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';

const sendWithFailure = async (failure: Error) => {
  const lambdaClient = new Lambda({
    region: 'eu-central-1',
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
    maxAttempts: 1,
  });

  addLambdaRateLimitErrorMiddleware(lambdaClient);

  lambdaClient.middlewareStack.add(
    () => async () => {
      throw failure;
    },
    { step: 'deserialize', priority: 'high', name: 'stubTransportMiddleware' },
  );

  return lambdaClient.send(
    new TagResourceCommand({
      Resource: 'arn:aws:lambda:eu-central-1:123456789012:function:test',
      Tags: { checksum: 'abc' },
    }),
  );
};

describe('addLambdaRateLimitErrorMiddleware', () => {
  it('turns AWS throttling into a rate limited logic function exception', async () => {
    await expect(
      sendWithFailure(
        Object.assign(new Error('Rate exceeded'), {
          name: 'TooManyRequestsException',
        }),
      ),
    ).rejects.toMatchObject({
      code: LogicFunctionExceptionCode.LOGIC_FUNCTION_RATE_LIMITED,
    });
  });

  it('lets other errors through unchanged', async () => {
    const failure = Object.assign(new Error('Conflict'), {
      name: 'ResourceConflictException',
    });

    await expect(sendWithFailure(failure)).rejects.toBe(failure);
  });
});
