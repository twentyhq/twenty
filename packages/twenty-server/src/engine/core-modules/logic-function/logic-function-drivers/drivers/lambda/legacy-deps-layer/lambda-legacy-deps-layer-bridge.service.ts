import { type GetFunctionCommandOutput } from '@aws-sdk/client-lambda';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type LambdaLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-layer-manager.service';
import { type LambdaDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { buildLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-lambda-resource-name.util';
import { getLambdaLayerNameFromArn } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-layer-name-from-arn.util';

const LEGACY_DEPS_LAYER_NAME_PREFIX = 'deps';

export class LambdaLegacyDepsLayerBridgeService {
  constructor(
    private readonly options: Pick<LambdaDriverOptions, 'resourceNamespace'>,
    private readonly layerManager: LambdaLayerManagerService,
  ) {}

  async hasExpectedLayers({
    lambdaExecutor,
    flatApplication,
  }: {
    lambdaExecutor: GetFunctionCommandOutput;
    flatApplication: FlatApplication;
  }): Promise<boolean> {
    const isOnLegacyDepsLayer =
      this.layerManager.hasExpectedSdkLayer({
        lambdaExecutor,
        flatApplication,
      }) &&
      isDefined(
        this.findLegacyDepsLayerArn({ lambdaExecutor, flatApplication }),
      );

    return (
      isOnLegacyDepsLayer ||
      (await this.layerManager.hasExpectedLayers({
        lambdaExecutor,
        flatApplication,
      }))
    );
  }

  async resolveDepsLayerArn({
    lambdaExecutor,
    flatApplication,
  }: {
    lambdaExecutor: GetFunctionCommandOutput | undefined;
    flatApplication: FlatApplication;
  }): Promise<string> {
    return (
      (await this.layerManager.findExistingDepsLayerArn(flatApplication)) ??
      this.findLegacyDepsLayerArn({ lambdaExecutor, flatApplication }) ??
      (await this.layerManager.ensureDepsLayer(flatApplication))
    );
  }

  private findLegacyDepsLayerArn({
    lambdaExecutor,
    flatApplication,
  }: {
    lambdaExecutor: GetFunctionCommandOutput | undefined;
    flatApplication: Pick<FlatApplication, 'yarnLockChecksum'>;
  }): string | undefined {
    const legacyDepsLayerName = buildLambdaResourceName({
      resourceNamePrefix: LEGACY_DEPS_LAYER_NAME_PREFIX,
      namespace: this.options.resourceNamespace,
      checksum: flatApplication.yarnLockChecksum ?? 'default',
    });

    return lambdaExecutor?.Configuration?.Layers?.find(
      (layer) =>
        isDefined(layer.Arn) &&
        getLambdaLayerNameFromArn(layer.Arn) === legacyDepsLayerName,
    )?.Arn;
  }
}
