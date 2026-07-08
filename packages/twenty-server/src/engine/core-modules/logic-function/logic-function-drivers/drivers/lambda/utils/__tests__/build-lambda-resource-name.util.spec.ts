import { buildLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-lambda-resource-name.util';

describe('buildLambdaResourceName', () => {
  it('joins prefix, namespace and checksum', () => {
    expect(
      buildLambdaResourceName({
        resourceNamePrefix: 'twenty-builder',
        namespace: 'abc123',
        checksum: 'def456',
      }),
    ).toBe('twenty-builder-abc123-def456');
  });

  it('omits the namespace segment when it is undefined', () => {
    expect(
      buildLambdaResourceName({
        resourceNamePrefix: 'deps',
        checksum: 'def456',
      }),
    ).toBe('deps-def456');
  });

  it('omits the namespace segment when it is an empty string', () => {
    expect(
      buildLambdaResourceName({
        resourceNamePrefix: 'deps',
        namespace: '',
        checksum: 'def456',
      }),
    ).toBe('deps-def456');
  });
});
