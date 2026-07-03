import { computeHashedLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/compute-hashed-lambda-resource-name.util';

describe('computeHashedLambdaResourceName', () => {
  it('returns prefix concatenated with a 12-character sha256 hex checksum of the contents', () => {
    const name = computeHashedLambdaResourceName({
      resourceNamePrefix: 'twenty-builder',
      contents: ['handler-code'],
    });

    expect(name).toMatch(/^twenty-builder-[0-9a-f]{12}$/);
  });

  it('inserts the namespace as a distinct segment before the checksum', () => {
    const name = computeHashedLambdaResourceName({
      resourceNamePrefix: 'twenty-builder',
      namespace: 'abc123def0',
      contents: ['handler-code'],
    });

    expect(name).toMatch(/^twenty-builder-abc123def0-[0-9a-f]{12}$/);
  });

  it('keeps the checksum stable and only prepends the namespace', () => {
    const withoutNamespace = computeHashedLambdaResourceName({
      resourceNamePrefix: 'twenty-builder',
      contents: ['handler-code'],
    });
    const withNamespace = computeHashedLambdaResourceName({
      resourceNamePrefix: 'twenty-builder',
      namespace: 'abc123def0',
      contents: ['handler-code'],
    });

    const checksum = withoutNamespace.replace('twenty-builder-', '');

    expect(withNamespace).toBe(`twenty-builder-abc123def0-${checksum}`);
  });

  it('omits the namespace segment when it is an empty string', () => {
    const name = computeHashedLambdaResourceName({
      resourceNamePrefix: 'twenty-builder',
      namespace: '',
      contents: ['handler-code'],
    });

    expect(name).toMatch(/^twenty-builder-[0-9a-f]{12}$/);
  });
});
