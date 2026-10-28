import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-lambda-resource-name.util';

export const DEPS_LAYER_NAME_PREFIX = 'depsv1';

export const getLambdaDepsLayerName = ({
  flatApplication,
  namespace,
}: {
  flatApplication: FlatApplication;
  namespace?: string;
}): string =>
  buildLambdaResourceName({
    resourceNamePrefix: DEPS_LAYER_NAME_PREFIX,
    namespace,
    checksum: isDefined(flatApplication.yarnLockChecksum)
      ? `${flatApplication.universalIdentifier}-${flatApplication.yarnLockChecksum}`
      : `${flatApplication.universalIdentifier}-nolock-${flatApplication.packageJsonChecksum}`,
  });
