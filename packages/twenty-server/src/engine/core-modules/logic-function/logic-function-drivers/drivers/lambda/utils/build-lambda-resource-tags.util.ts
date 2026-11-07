import { isDefined } from 'twenty-shared/utils';

import { LAMBDA_SDK_CLIENT_CHECKSUM_TAG } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';

export const buildLambdaResourceTags = ({
  resourceTags,
  sdkClientCoreChecksum,
}: {
  resourceTags?: Record<string, string>;
  sdkClientCoreChecksum?: string | null;
}): Record<string, string> | undefined => {
  const tags = { ...resourceTags };

  if (isDefined(sdkClientCoreChecksum)) {
    tags[LAMBDA_SDK_CLIENT_CHECKSUM_TAG] = sdkClientCoreChecksum;
  }

  if (Object.keys(tags).length === 0) {
    return undefined;
  }

  return tags;
};
