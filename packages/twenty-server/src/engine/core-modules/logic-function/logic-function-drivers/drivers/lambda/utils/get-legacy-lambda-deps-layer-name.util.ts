import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-lambda-resource-name.util';

const LEGACY_DEPS_LAYER_NAME_PREFIX = 'deps';

export const getLegacyLambdaDepsLayerName = ({
  flatApplication,
  namespace,
}: {
  flatApplication: FlatApplication;
  namespace?: string;
}): string =>
  buildLambdaResourceName({
    resourceNamePrefix: LEGACY_DEPS_LAYER_NAME_PREFIX,
    namespace,
    checksum: flatApplication.yarnLockChecksum ?? 'default',
  });
