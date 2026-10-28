import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-lambda-resource-name.util';

export const DEPS_LAYER_NAME_PREFIX = 'depsv1';

export const getLambdaDepsLayerName = ({
  flatApplication,
  applicationUniversalIdentifier,
  namespace,
}: {
  flatApplication: FlatApplication;
  applicationUniversalIdentifier: string;
  namespace?: string;
}): string =>
  buildLambdaResourceName({
    resourceNamePrefix: DEPS_LAYER_NAME_PREFIX,
    namespace,
    checksum: isDefined(flatApplication.yarnLockChecksum)
      ? `${applicationUniversalIdentifier}-${flatApplication.yarnLockChecksum}`
      : `${applicationUniversalIdentifier}-nolock-${flatApplication.packageJsonChecksum}`,
  });
