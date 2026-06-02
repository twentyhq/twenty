import * as fs from 'fs/promises';

import {
  DeleteLayerVersionCommand,
  type GetFunctionCommandOutput,
  ListLayerVersionsCommand,
  PublishLayerVersionCommand,
} from '@aws-sdk/client-lambda';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  LIST_LAYER_VERSIONS_PAGE_SIZE,
  SDK_LAYER_PREFIX_IN_ZIP,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/lambda-driver.constants';
import { type LambdaDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/lambda-driver.types';
import { type LambdaAwsClient } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/lambda-aws-client';
import { type LambdaToolFunctions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/lambda-tool-functions';
import { getDepsLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-deps-layer-name';
import { getSdkLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-sdk-layer-name';
import { reprefixZipEntries } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/reprefix-zip-entries';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { type SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

type LayerAppContext = {
  flatApplication: FlatApplication;
  applicationUniversalIdentifier: string;
};

export class LambdaLayerManager {
  constructor(
    private readonly options: Pick<LambdaDriverOptions, 'layerBucket'>,
    private readonly awsClient: LambdaAwsClient,
    private readonly toolFunctions: LambdaToolFunctions,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
    private readonly sdkClientArchiveService: SdkClientArchiveService,
  ) {}

  async ensureDepsLayer(context: LayerAppContext): Promise<string> {
    const layerName = getDepsLayerName(context.flatApplication);

    const existingArn = await this.awsClient.getExistingLayerArn(layerName);

    if (isDefined(existingArn)) {
      return existingArn;
    }

    await this.createDepsLayer({ ...context, layerName });

    const newArn = await this.awsClient.getExistingLayerArn(layerName);

    if (!isDefined(newArn)) {
      throw new Error(
        `Layer '${layerName}' was not created by the yarn install Lambda`,
      );
    }

    return newArn;
  }

  async ensureSdkLayer(context: LayerAppContext): Promise<string> {
    const { flatApplication, applicationUniversalIdentifier } = context;
    const layerName = getSdkLayerName({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
    });

    if (!flatApplication.isSdkLayerStale) {
      const existingArn = await this.awsClient.getExistingLayerArn(layerName);

      if (isDefined(existingArn)) {
        return existingArn;
      }
    }

    await this.deleteAllLayerVersions(layerName);

    const sdkArchiveBuffer =
      await this.sdkClientArchiveService.downloadArchiveBuffer({
        workspaceId: flatApplication.workspaceId,
        applicationId: flatApplication.id,
        applicationUniversalIdentifier,
      });

    const zipBuffer = await reprefixZipEntries({
      sourceBuffer: sdkArchiveBuffer,
      prefix: SDK_LAYER_PREFIX_IN_ZIP,
    });

    const arn = await this.publishLayer({ layerName, zipBuffer });

    await this.sdkClientArchiveService.markSdkLayerFresh({
      applicationId: flatApplication.id,
      workspaceId: flatApplication.workspaceId,
    });

    return arn;
  }

  hasExpectedLayers({
    lambdaExecutor,
    flatApplication,
    applicationUniversalIdentifier,
  }: LayerAppContext & {
    lambdaExecutor: GetFunctionCommandOutput;
  }): boolean {
    const layers = lambdaExecutor.Configuration?.Layers;

    if (!isDefined(layers) || layers.length !== 2) {
      return false;
    }

    const depsLayerName = getDepsLayerName(flatApplication);
    const sdkLayerName = getSdkLayerName({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
    });

    return (
      layers.some((layer) => layer.Arn?.includes(depsLayerName)) &&
      layers.some((layer) => layer.Arn?.includes(sdkLayerName))
    );
  }

  private async createDepsLayer({
    flatApplication,
    applicationUniversalIdentifier,
    layerName,
  }: LayerAppContext & { layerName: string }): Promise<void> {
    // Re-check inside this method in case a concurrent caller created the
    // layer between ensureDepsLayer's initial check and this point.
    const existingArn = await this.awsClient.getExistingLayerArn(layerName);

    if (isDefined(existingArn)) {
      return;
    }

    const { packageJson, yarnLock } = await this.getDependencyContents({
      flatApplication,
      applicationUniversalIdentifier,
    });

    const s3Key = `lambda-layers/${layerName}.zip`;
    const presignedUploadUrl =
      await this.awsClient.generatePresignedUploadUrl(s3Key);

    await this.toolFunctions.runYarnInstallCreateLayer({
      packageJson,
      yarnLock,
      presignedUploadUrl,
    });

    const lambdaClient = await this.awsClient.getLambdaClient();
    const publishResult = await lambdaClient.send(
      new PublishLayerVersionCommand({
        LayerName: layerName,
        Content: {
          S3Bucket: this.options.layerBucket,
          S3Key: s3Key,
        },
        CompatibleRuntimes: [
          LogicFunctionRuntime.NODE18,
          LogicFunctionRuntime.NODE22,
        ],
      }),
    );

    if (!publishResult.LayerVersionArn) {
      throw new Error(
        `PublishLayerVersion did not return a LayerVersionArn for layer '${layerName}'`,
      );
    }
  }

  private async getDependencyContents({
    flatApplication,
    applicationUniversalIdentifier,
  }: LayerAppContext): Promise<{ packageJson: string; yarnLock: string }> {
    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir } = await temporaryDirManager.init();

    try {
      await this.logicFunctionResourceService.copyDependenciesInMemory({
        applicationUniversalIdentifier,
        workspaceId: flatApplication.workspaceId,
        inMemoryFolderPath: sourceTemporaryDir,
      });

      const [packageJson, yarnLock] = await Promise.all([
        fs.readFile(`${sourceTemporaryDir}/package.json`, 'utf-8'),
        fs.readFile(`${sourceTemporaryDir}/yarn.lock`, 'utf-8'),
      ]);

      return { packageJson, yarnLock };
    } finally {
      await temporaryDirManager.clean();
    }
  }

  private async publishLayer({
    layerName,
    zipBuffer,
  }: {
    layerName: string;
    zipBuffer: Buffer;
  }): Promise<string> {
    const lambdaClient = await this.awsClient.getLambdaClient();

    const result = await lambdaClient.send(
      new PublishLayerVersionCommand({
        LayerName: layerName,
        Content: { ZipFile: zipBuffer },
        CompatibleRuntimes: [
          LogicFunctionRuntime.NODE18,
          LogicFunctionRuntime.NODE22,
        ],
      }),
    );

    if (!isDefined(result.LayerVersionArn)) {
      throw new Error('New layer version ARN is undefined');
    }

    return result.LayerVersionArn;
  }

  private async deleteAllLayerVersions(layerName: string): Promise<void> {
    const lambdaClient = await this.awsClient.getLambdaClient();
    let marker: string | undefined;

    do {
      const listResult = await lambdaClient.send(
        new ListLayerVersionsCommand({
          LayerName: layerName,
          MaxItems: LIST_LAYER_VERSIONS_PAGE_SIZE,
          Marker: marker,
        }),
      );

      const versions = listResult.LayerVersions ?? [];

      await Promise.all(
        versions.map((version) =>
          lambdaClient.send(
            new DeleteLayerVersionCommand({
              LayerName: layerName,
              VersionNumber: version.Version,
            }),
          ),
        ),
      );

      marker = listResult.NextMarker;
    } while (isDefined(marker));
  }
}
