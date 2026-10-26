import { LAMBDA_SDK_CLIENT_CHECKSUM_TAG } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { buildLambdaResourceTags } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-lambda-resource-tags.util';

describe('buildLambdaResourceTags', () => {
  it.each<{
    resourceTags: Record<string, string> | undefined;
    checksum: string | null;
    expected: Record<string, string> | undefined;
  }>([
    {
      resourceTags: {
        Environment: 'production',
        [LAMBDA_SDK_CLIENT_CHECKSUM_TAG]: 'configured-checksum',
      },
      checksum: 'current-sdk',
      expected: {
        Environment: 'production',
        [LAMBDA_SDK_CLIENT_CHECKSUM_TAG]: 'current-sdk',
      },
    },
    {
      resourceTags: undefined,
      checksum: 'current-sdk',
      expected: { [LAMBDA_SDK_CLIENT_CHECKSUM_TAG]: 'current-sdk' },
    },
    {
      resourceTags: { Environment: 'production' },
      checksum: null,
      expected: { Environment: 'production' },
    },
    { resourceTags: undefined, checksum: null, expected: undefined },
  ])(
    'combines configured tags and the authoritative SDK checksum ($checksum, $resourceTags)',
    ({ resourceTags, checksum, expected }) => {
      expect(
        buildLambdaResourceTags({
          resourceTags,
          sdkClientCoreChecksum: checksum,
        }),
      ).toEqual(expected);
    },
  );

  it('does not mutate the configured tags', () => {
    const resourceTags = { Environment: 'production' };

    buildLambdaResourceTags({
      resourceTags,
      sdkClientCoreChecksum: 'current-sdk',
    });

    expect(resourceTags).toEqual({ Environment: 'production' });
  });
});
