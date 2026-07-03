import { createHash } from 'crypto';

import { buildLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-lambda-resource-name.util';

const RESOURCE_NAME_CHECKSUM_LENGTH = 12;

export const computeHashedLambdaResourceName = ({
  resourceNamePrefix,
  namespace,
  contents,
}: {
  resourceNamePrefix: string;
  namespace?: string;
  contents: ReadonlyArray<string>;
}): string => {
  const hash = createHash('sha256');

  for (const content of contents) {
    hash.update(content);
  }

  const checksum = hash.digest('hex').slice(0, RESOURCE_NAME_CHECKSUM_LENGTH);

  return buildLambdaResourceName({ resourceNamePrefix, namespace, checksum });
};
