import { isLambdaRateLimitError } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/is-lambda-rate-limit-error.util';

const buildError = (name: string) =>
  Object.assign(new Error('Rate exceeded'), { name });

describe('isLambdaRateLimitError', () => {
  it('detects the throttling errors the Lambda API returns', () => {
    expect(isLambdaRateLimitError(buildError('TooManyRequestsException'))).toBe(
      true,
    );
    expect(isLambdaRateLimitError(buildError('ThrottlingException'))).toBe(
      true,
    );
  });

  it('ignores other errors', () => {
    expect(
      isLambdaRateLimitError(buildError('ResourceConflictException')),
    ).toBe(false);
    expect(isLambdaRateLimitError('Rate exceeded')).toBe(false);
  });
});
