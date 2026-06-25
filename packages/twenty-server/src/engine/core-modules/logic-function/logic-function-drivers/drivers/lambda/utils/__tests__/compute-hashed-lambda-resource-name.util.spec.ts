import { computeHashedLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/compute-hashed-lambda-resource-name.util';

describe('computeHashedLambdaResourceName', () => {
  it('returns prefix concatenated with a 12-character sha256 hex checksum of the contents', () => {
    const name = computeHashedLambdaResourceName({
      prefix: 'twenty-builder',
      contents: ['handler-code'],
    });

    expect(name).toMatch(/^twenty-builder-[0-9a-f]{12}$/);
  });
});
