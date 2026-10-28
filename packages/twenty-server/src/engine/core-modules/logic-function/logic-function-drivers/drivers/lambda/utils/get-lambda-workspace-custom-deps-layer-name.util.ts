import { buildLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-lambda-resource-name.util';
import { DEPS_LAYER_NAME_PREFIX } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-deps-layer-name.util';

export const getLambdaWorkspaceCustomDepsLayerName = ({
  yarnLockChecksum,
  namespace,
}: {
  yarnLockChecksum: string;
  namespace?: string;
}): string =>
  buildLambdaResourceName({
    resourceNamePrefix: DEPS_LAYER_NAME_PREFIX,
    namespace,
    checksum: `custom-${yarnLockChecksum}`,
  });
