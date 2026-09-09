import * as fs from 'fs/promises';

import {
  DeleteLayerVersionCommand,
  type GetFunctionCommandOutput,
  InvalidParameterValueException,
  ListLayerVersionsCommand,
  PublishLayerVersionCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-lambda';
import { Logger } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { SDK_LAYER_PREFIX_IN_ZIP } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { type LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { type LambdaDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { getLambdaDepsLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-deps-layer-name.util';
import { getLambdaSdkLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-sdk-layer-name.util';
import { reprefixLambdaZipEntries } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/reprefix-lambda-zip-entries.util';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { type SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

type LayerAppContext = {
  flatApplication: FlatApplication;
  applicationUniversalIdentifier: string;
};

const SDK_LAYER_LOCK_TTL_MS = 120_000;
const SDK_LAYER_LOCK_RETRY_MS = 500;
const SDK_LAYER_LOCK_MAX_RETRIES = 240;

export class LambdaLayerManagerService {
  private readonly logger = new Logger(LambdaLayerManagerService.name);

  constructor(
    private readonly options: Pick<
      LambdaDriverOptions,
      'layerBucket' | 'resourceNamespace'
    >,
    private readonly awsClient: LambdaAwsClientService,
    private readonly toolFunctions: LambdaToolFunctionsService,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
    private readonly sdkClientArchiveService: SdkClientArchiveService,
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async ensureDepsLayer(context: LayerAppContext): Promise<string> {
    const layerName = getLambdaDepsLayerName({
      flatApplication: context.flatApplication,
      namespace: this.options.resourceNamespace,
    });

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
    const layerName = getLambdaSdkLayerName({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
    });

    const existingArn = await this.findFreshSdkLayerArn({
      flatApplication,
      layerName,
    });

    if (isDefined(existingArn)) {
      return existingArn;
    }

    // The layer is shared by every function of the application while build
    // locks are per function: without this lock two concurrent builds both
    // delete all versions and one deletes the version the other just published.
    return this.cacheLockService.withLock(
      async () => {
        const refreshedFlatApplication =
          await this.refreshFlatApplication(flatApplication);

        const arnPublishedWhileWaiting = await this.findFreshSdkLayerArn({
          flatApplication: refreshedFlatApplication,
          layerName,
        });

        if (isDefined(arnPublishedWhileWaiting)) {
          return arnPublishedWhileWaiting;
        }

        return this.rebuildSdkLayer({
          flatApplication: refreshedFlatApplication,
          applicationUniversalIdentifier,
          layerName,
        });
      },
      `lambda-sdk-layer:${layerName}`,
      {
        ttl: SDK_LAYER_LOCK_TTL_MS,
        ms: SDK_LAYER_LOCK_RETRY_MS,
        maxRetries: SDK_LAYER_LOCK_MAX_RETRIES,
      },
    );
  }

  private async findFreshSdkLayerArn({
    flatApplication,
    layerName,
  }: {
    flatApplication: FlatApplication;
    layerName: string;
  }): Promise<string | undefined> {
    if (flatApplication.isSdkLayerStale) {
      return undefined;
    }

    return this.awsClient.getExistingLayerArn(layerName);
  }

  private async refreshFlatApplication(
    flatApplication: FlatApplication,
  ): Promise<FlatApplication> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(
        flatApplication.workspaceId,
        ['flatApplicationMaps'],
      );

    return flatApplicationMaps.byId[flatApplication.id] ?? flatApplication;
  }

  private async rebuildSdkLayer({
    flatApplication,
    applicationUniversalIdentifier,
    layerName,
  }: LayerAppContext & { layerName: string }): Promise<string> {
    await this.deleteAllLayerVersions(layerName);

    const sdkArchiveBuffer =
      await this.sdkClientArchiveService.downloadArchiveBuffer({
        workspaceId: flatApplication.workspaceId,
        applicationId: flatApplication.id,
        applicationUniversalIdentifier,
      });

    const zipBuffer = await reprefixLambdaZipEntries({
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

  async deleteSdkLayer({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const layerName = getLambdaSdkLayerName({
      workspaceId,
      applicationUniversalIdentifier,
    });

    await this.deleteAllLayerVersions(layerName);
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

    const depsLayerName = getLambdaDepsLayerName({
      flatApplication,
      namespace: this.options.resourceNamespace,
    });
    const sdkLayerName = getLambdaSdkLayerName({
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

    let publishResult;

    try {
      publishResult = await lambdaClient.send(
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
    } catch (error) {
      if (
        error instanceof InvalidParameterValueException &&
        error.message.toLowerCase().includes('size')
      ) {
        throw new LogicFunctionException(
          `Dependency layer '${layerName}' exceeds the Lambda layer size limit: ${error.message}`,
          LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
        );
      }

      throw error;
    }

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
      let listResult;

      try {
        listResult = await lambdaClient.send(
          new ListLayerVersionsCommand({
            LayerName: layerName,
            MaxItems: 50,
            Marker: marker,
          }),
        );
      } catch (error) {
        // Layer never existed or already fully removed. Idempotent.
        if (error instanceof ResourceNotFoundException) {
          return;
        }

        throw error;
      }

      const versions = listResult.LayerVersions ?? [];

      await Promise.all(
        versions.map(async (version) => {
          try {
            await lambdaClient.send(
              new DeleteLayerVersionCommand({
                LayerName: layerName,
                VersionNumber: version.Version,
              }),
            );
          } catch (error) {
            // Already gone: another concurrent cleanup removed it. Idempotent.
            if (error instanceof ResourceNotFoundException) {
              return;
            }

            throw error;
          }
        }),
      );

      marker = listResult.NextMarker;
    } while (isDefined(marker));
  }
}
