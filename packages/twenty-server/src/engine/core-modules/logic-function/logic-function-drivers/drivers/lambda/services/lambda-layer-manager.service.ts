import {
  DeleteLayerVersionCommand,
  type GetFunctionCommandOutput,
  InvalidParameterValueException,
  ListLayerVersionsCommand,
  PublishLayerVersionCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-lambda';
import { Logger } from '@nestjs/common';
import { EMPTY_YARN_LOCK_CONTENT } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { WORKSPACE_CUSTOM_APPLICATION_DEPENDENCIES_DIRECTORY_NAME } from 'src/engine/core-modules/application/application-package/constants/workspace-custom-application-dependencies-directory-name';
import { getDefaultApplicationPackageFields } from 'src/engine/core-modules/application/application-package/utils/get-default-application-package-fields.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  BUILD_LOCK_RETRY_MS,
  BUILD_LOCK_TTL_MS,
  BUILD_LOCK_MAX_RETRIES,
  LAMBDA_SDK_CLIENT_CHECKSUM_TAG,
  SDK_LAYER_PREFIX_IN_ZIP,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { type LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { type LambdaDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { getLambdaDepsLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-deps-layer-name.util';
import { getLambdaLayerNameFromArn } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-layer-name-from-arn.util';
import { getLambdaSdkLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-sdk-layer-name.util';
import { getLambdaWorkspaceCustomDepsLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-workspace-custom-deps-layer-name.util';
import { reprefixLambdaZipEntries } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/reprefix-lambda-zip-entries.util';
import { sanitizeApplicationPackageJson } from 'src/engine/core-modules/logic-function/logic-function-resource/utils/sanitize-application-package-json.util';
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

type DepsLayerDependencies = {
  packageJson: string;
  yarnLock: string;
};

const LAYER_LOCK_OPTIONS = {
  ttl: BUILD_LOCK_TTL_MS,
  ms: BUILD_LOCK_RETRY_MS,
  maxRetries: BUILD_LOCK_MAX_RETRIES,
};

export class LambdaLayerManagerService {
  private readonly logger = new Logger(LambdaLayerManagerService.name);

  constructor(
    private readonly options: Pick<
      LambdaDriverOptions,
      'layerBucket' | 'resourceNamespace'
    >,
    private readonly awsClient: LambdaAwsClientService,
    private readonly toolFunctions: LambdaToolFunctionsService,
    private readonly applicationDependencyFilesService: ApplicationDependencyFilesService,
    private readonly sdkClientArchiveService: SdkClientArchiveService,
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async ensureDepsLayer({
    flatApplication,
    applicationUniversalIdentifier,
  }: LayerAppContext): Promise<string> {
    const existingArn = await this.findExistingDepsLayerArn({
      flatApplication,
      applicationUniversalIdentifier,
    });

    if (isDefined(existingArn)) {
      return existingArn;
    }

    const workspaceCustomDepsLayerName =
      await this.getWorkspaceCustomDepsLayerName(flatApplication);

    if (isDefined(workspaceCustomDepsLayerName)) {
      const defaultDependencies =
        await this.findWorkspaceCustomDefaultDependencies(flatApplication);

      if (isDefined(defaultDependencies)) {
        return this.buildDepsLayer({
          layerName: workspaceCustomDepsLayerName,
          dependencies: defaultDependencies,
        });
      }
    }

    return this.buildDepsLayer({
      layerName: this.getDepsLayerName({
        flatApplication,
        applicationUniversalIdentifier,
      }),
      dependencies: await this.getVerifiedDependencies({
        flatApplication,
        applicationUniversalIdentifier,
      }),
    });
  }

  async findExistingDepsLayerArn(
    context: LayerAppContext,
  ): Promise<string | undefined> {
    for (const layerName of await this.getDepsLayerNames(context)) {
      const existingArn = await this.awsClient.getExistingLayerArn(layerName);

      if (isDefined(existingArn)) {
        return existingArn;
      }
    }

    return undefined;
  }

  async getDepsLayerNames({
    flatApplication,
    applicationUniversalIdentifier,
  }: LayerAppContext): Promise<string[]> {
    const workspaceCustomDepsLayerName =
      await this.getWorkspaceCustomDepsLayerName(flatApplication);

    return [
      workspaceCustomDepsLayerName,
      this.getDepsLayerName({
        flatApplication,
        applicationUniversalIdentifier,
      }),
    ].filter(isDefined);
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
      LAYER_LOCK_OPTIONS,
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

  hasExpectedSdkLayer({
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

    const sdkLayerName = getLambdaSdkLayerName({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
    });

    const isOnCurrentSdkClient =
      !isDefined(flatApplication.sdkClientCoreChecksum) ||
      lambdaExecutor.Tags?.[LAMBDA_SDK_CLIENT_CHECKSUM_TAG] ===
        flatApplication.sdkClientCoreChecksum;

    return (
      isOnCurrentSdkClient &&
      layers.some((layer) => layer.Arn?.includes(sdkLayerName))
    );
  }

  async hasExpectedLayers({
    lambdaExecutor,
    ...context
  }: LayerAppContext & {
    lambdaExecutor: GetFunctionCommandOutput;
  }): Promise<boolean> {
    if (!this.hasExpectedSdkLayer({ lambdaExecutor, ...context })) {
      return false;
    }

    const depsLayerNames = await this.getDepsLayerNames(context);

    return (lambdaExecutor.Configuration?.Layers ?? []).some((layer) => {
      const layerName = isDefined(layer.Arn)
        ? getLambdaLayerNameFromArn(layer.Arn)
        : undefined;

      return isDefined(layerName) && depsLayerNames.includes(layerName);
    });
  }

  private getDepsLayerName({
    flatApplication,
    applicationUniversalIdentifier,
  }: LayerAppContext): string {
    return getLambdaDepsLayerName({
      flatApplication,
      applicationUniversalIdentifier,
      namespace: this.options.resourceNamespace,
    });
  }

  private async getWorkspaceCustomDepsLayerName(
    flatApplication: FlatApplication,
  ): Promise<string | undefined> {
    if (!isDefined(flatApplication.yarnLockChecksum)) {
      return undefined;
    }

    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      flatApplication.workspaceId,
    );

    if (workspace?.workspaceCustomApplicationId !== flatApplication.id) {
      return undefined;
    }

    return getLambdaWorkspaceCustomDepsLayerName({
      yarnLockChecksum: flatApplication.yarnLockChecksum,
      namespace: this.options.resourceNamespace,
    });
  }

  private async findWorkspaceCustomDefaultDependencies(
    flatApplication: FlatApplication,
  ): Promise<DepsLayerDependencies | undefined> {
    const { yarnLockChecksum, packageJsonContent, yarnLockContent } =
      await getDefaultApplicationPackageFields({
        directory: WORKSPACE_CUSTOM_APPLICATION_DEPENDENCIES_DIRECTORY_NAME,
      });

    if (yarnLockChecksum !== flatApplication.yarnLockChecksum) {
      return undefined;
    }

    return {
      packageJson: sanitizeApplicationPackageJson(packageJsonContent),
      yarnLock: yarnLockContent,
    };
  }

  private async buildDepsLayer({
    layerName,
    dependencies,
  }: {
    layerName: string;
    dependencies: DepsLayerDependencies;
  }): Promise<string> {
    return this.cacheLockService.withLock(
      async () => {
        const arnCreatedWhileWaiting =
          await this.awsClient.getExistingLayerArn(layerName);

        if (isDefined(arnCreatedWhileWaiting)) {
          return arnCreatedWhileWaiting;
        }

        await this.createDepsLayer({ layerName, ...dependencies });

        const newArn = await this.awsClient.getExistingLayerArn(layerName);

        if (!isDefined(newArn)) {
          throw new Error(
            `Layer '${layerName}' was not created by the yarn install Lambda`,
          );
        }

        return newArn;
      },
      `lambda-deps-layer:${layerName}`,
      LAYER_LOCK_OPTIONS,
    );
  }

  private async createDepsLayer({
    layerName,
    packageJson,
    yarnLock,
  }: {
    layerName: string;
    packageJson: string;
    yarnLock: string;
  }): Promise<void> {
    const existingArn = await this.awsClient.getExistingLayerArn(layerName);

    if (isDefined(existingArn)) {
      return;
    }

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

  private async getVerifiedDependencies({
    flatApplication,
    applicationUniversalIdentifier,
  }: LayerAppContext): Promise<DepsLayerDependencies> {
    const { packageJsonContent, yarnLockContent } =
      await this.applicationDependencyFilesService.getVerifiedDependencyContentsOrThrow(
        {
          workspaceId: flatApplication.workspaceId,
          applicationUniversalIdentifier,
          declaredChecksums: flatApplication,
        },
      );

    if (
      isDefined(flatApplication.yarnLockChecksum) &&
      !isDefined(yarnLockContent)
    ) {
      throw new ApplicationException(
        `Application ${applicationUniversalIdentifier} declares a yarn.lock that is not stored`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    return {
      packageJson: sanitizeApplicationPackageJson(packageJsonContent),
      yarnLock: yarnLockContent ?? EMPTY_YARN_LOCK_CONTENT,
    };
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
