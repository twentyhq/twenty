import { UpdateFunctionConfigurationCommand } from '@aws-sdk/client-lambda';
import { isDefined } from 'twenty-shared/utils';

import { findOutdatedLambdaDepsLayerArns } from 'src/database/commands/upgrade-version-command/2-53/utils/find-outdated-lambda-deps-layer-arns.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  BUILD_LOCK_MAX_RETRIES,
  BUILD_LOCK_RETRY_MS,
  BUILD_LOCK_TTL_MS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { type LambdaLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-layer-manager.service';
import { getLambdaExecutorBuildLockKey } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-executor-build-lock-key.util';
import { getLambdaSdkLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-sdk-layer-name.util';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const migrateLambdaFunctionDepsLayer = async ({
  awsClient,
  layerManager,
  cacheLockService,
  flatLogicFunction,
  flatApplication,
  applicationUniversalIdentifier,
}: {
  awsClient: LambdaAwsClientService;
  layerManager: LambdaLayerManagerService;
  cacheLockService: CacheLockService;
  flatLogicFunction: FlatLogicFunction;
  flatApplication: FlatApplication;
  applicationUniversalIdentifier: string;
}): Promise<boolean> =>
  cacheLockService.withLock(
    async () => {
      const lambdaExecutor = await awsClient.getFunction(flatLogicFunction.id);

      if (!isDefined(lambdaExecutor)) {
        return false;
      }

      const layerArns = (lambdaExecutor.Configuration?.Layers ?? [])
        .map((layer) => layer.Arn)
        .filter(isDefined);

      const outdatedDepsLayerArns = findOutdatedLambdaDepsLayerArns({
        layerArns,
        depsLayerNames: await layerManager.getDepsLayerNames({
          flatApplication,
          applicationUniversalIdentifier,
        }),
        sdkLayerName: getLambdaSdkLayerName({
          workspaceId: flatApplication.workspaceId,
          applicationUniversalIdentifier,
        }),
      });

      if (outdatedDepsLayerArns.length === 0) {
        return false;
      }

      const depsLayerArn = await layerManager.ensureDepsLayer({
        flatApplication,
        applicationUniversalIdentifier,
      });
      const keptLayerArns = layerArns.filter(
        (layerArn) =>
          !outdatedDepsLayerArns.includes(layerArn) && layerArn !== depsLayerArn,
      );

      const lambdaClient = await awsClient.getLambdaClient();

      await lambdaClient.send(
        new UpdateFunctionConfigurationCommand({
          FunctionName: flatLogicFunction.id,
          Layers: [depsLayerArn, ...keptLayerArns],
        }),
      );
      await awsClient.waitFunctionUpdated(flatLogicFunction.id);
      await awsClient.clearFunctionCache(flatLogicFunction.id);

      return true;
    },
    getLambdaExecutorBuildLockKey(flatLogicFunction.id),
    {
      ttl: BUILD_LOCK_TTL_MS,
      ms: BUILD_LOCK_RETRY_MS,
      maxRetries: BUILD_LOCK_MAX_RETRIES,
    },
  );
