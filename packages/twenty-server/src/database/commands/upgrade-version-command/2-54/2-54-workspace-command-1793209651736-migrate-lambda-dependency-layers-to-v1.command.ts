import { UpdateFunctionConfigurationCommand } from '@aws-sdk/client-lambda';
import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  BUILD_LOCK_MAX_RETRIES,
  BUILD_LOCK_RETRY_MS,
  BUILD_LOCK_TTL_MS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-layer-manager.service';
import { LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { getLambdaConnectionOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-connection-options.util';
import { getLambdaExecutorBuildLockKey } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-executor-build-lock-key.util';
import { getLambdaLayerNameFromArn } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-layer-name-from-arn.util';
import { getLambdaSdkLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-sdk-layer-name.util';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type LambdaDepsLayerServices = {
  awsClient: LambdaAwsClientService;
  layerManager: LambdaLayerManagerService;
};

type LogicFunctionMigrationOutcome =
  | 'migrated'
  | 'alreadyMigrated'
  | 'notMigrated';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

@RegisteredWorkspaceCommand('2.54.0', 1793209651736)
@Command({
  name: 'upgrade:2-54:migrate-lambda-dependency-layers-to-v1',
  description:
    'Recompute application dependency checksums from the stored files and move logic functions to their v1 dependency layer',
})
export class MigrateLambdaDependencyLayersToV1Command extends ProvisionedWorkspaceCommandRunner {
  private lambdaDepsLayerServices: LambdaDepsLayerServices | undefined;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly applicationDependencyFilesService: ApplicationDependencyFilesService,
    private readonly sdkClientArchiveService: SdkClientArchiveService,
    private readonly cacheLockService: CacheLockService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleApplications)
    private readonly cacheStorageService: CacheStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun === true;

    await this.backfillDependencyChecksums({ workspaceId, isDryRun });

    if (
      isDryRun ||
      this.twentyConfigService.get('LOGIC_FUNCTION_TYPE') !==
        LogicFunctionDriverType.LAMBDA
    ) {
      return;
    }

    await this.migrateDependencyLayers(workspaceId);
  }

  private async backfillDependencyChecksums({
    workspaceId,
    isDryRun,
  }: {
    workspaceId: string;
    isDryRun: boolean;
  }): Promise<void> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    for (const flatApplication of Object.values(flatApplicationMaps.byId)) {
      if (!isDefined(flatApplication) || isDefined(flatApplication.deletedAt)) {
        continue;
      }

      const dependencyChecksums = await this.applicationDependencyFilesService
        .getDependencyContents({
          workspaceId,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
        })
        .then(({ storedFilesChecksums }) => storedFilesChecksums)
        .catch((error: unknown) => {
          this.logger.warn(
            `Skipping dependency checksum backfill of application ${flatApplication.id} in workspace ${workspaceId}: ${getErrorMessage(error)}`,
          );

          return undefined;
        });

      if (!isDefined(dependencyChecksums)) {
        continue;
      }

      const isUpToDate =
        dependencyChecksums.packageJsonChecksum ===
          flatApplication.packageJsonChecksum &&
        dependencyChecksums.yarnLockChecksum ===
          flatApplication.yarnLockChecksum;

      if (isUpToDate) {
        continue;
      }

      if (isDryRun) {
        this.logger.log(
          `[DRY RUN] Would backfill dependency checksums of application ${flatApplication.id} in workspace ${workspaceId}`,
        );

        continue;
      }

      await this.applicationService.update(flatApplication.id, {
        ...dependencyChecksums,
        workspaceId,
      });
    }
  }

  private async migrateDependencyLayers(workspaceId: string): Promise<void> {
    const { flatApplicationMaps, flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
        'flatLogicFunctionMaps',
      ]);

    const outcomeCounts: Record<LogicFunctionMigrationOutcome, number> = {
      migrated: 0,
      alreadyMigrated: 0,
      notMigrated: 0,
    };

    for (const flatLogicFunction of Object.values(
      flatLogicFunctionMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatLogicFunction)) {
        continue;
      }

      const flatApplication =
        flatApplicationMaps.byId[flatLogicFunction.applicationId];

      if (!isDefined(flatApplication)) {
        continue;
      }

      try {
        const outcome = await this.migrateLogicFunction({
          flatLogicFunction,
          flatApplication,
        });

        outcomeCounts[outcome]++;
      } catch (error) {
        outcomeCounts.notMigrated++;
        this.logger.error(
          `Logic function ${flatLogicFunction.id} in workspace ${workspaceId} was not migrated: ${getErrorMessage(error)}`,
        );
      }
    }

    this.logger.log(
      `Workspace ${workspaceId}: ${outcomeCounts.migrated} logic function(s) migrated to their v1 dependency layer, ${outcomeCounts.alreadyMigrated} already migrated, ${outcomeCounts.notMigrated} not migrated`,
    );
  }

  private async migrateLogicFunction({
    flatLogicFunction,
    flatApplication,
  }: {
    flatLogicFunction: FlatLogicFunction;
    flatApplication: FlatApplication;
  }): Promise<LogicFunctionMigrationOutcome> {
    const { awsClient, layerManager } = this.getLambdaDepsLayerServices();

    return this.cacheLockService.withLock(
      async (): Promise<LogicFunctionMigrationOutcome> => {
        const lambdaExecutor = await awsClient.getFunction(
          flatLogicFunction.id,
        );

        if (!isDefined(lambdaExecutor)) {
          return 'notMigrated';
        }

        const layerArns = (lambdaExecutor.Configuration?.Layers ?? [])
          .map((layer) => layer.Arn)
          .filter(isDefined);
        const sdkLayerName = getLambdaSdkLayerName({
          workspaceId: flatApplication.workspaceId,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
        });
        const sdkLayerArn = layerArns.find(
          (layerArn) => getLambdaLayerNameFromArn(layerArn) === sdkLayerName,
        );
        const currentDepsLayerArn = layerArns.find(
          (layerArn) => layerArn !== sdkLayerArn,
        );

        if (!isDefined(sdkLayerArn) || !isDefined(currentDepsLayerArn)) {
          return 'notMigrated';
        }

        const currentDepsLayerName =
          getLambdaLayerNameFromArn(currentDepsLayerArn);
        const targetDepsLayerNames =
          await layerManager.getDepsLayerNames(flatApplication);

        if (
          isDefined(currentDepsLayerName) &&
          targetDepsLayerNames.includes(currentDepsLayerName)
        ) {
          return 'alreadyMigrated';
        }

        const depsLayerArn =
          await layerManager.ensureDepsLayer(flatApplication);
        const lambdaClient = await awsClient.getLambdaClient();

        await lambdaClient.send(
          new UpdateFunctionConfigurationCommand({
            FunctionName: flatLogicFunction.id,
            Layers: [depsLayerArn, sdkLayerArn],
          }),
        );
        await awsClient.waitFunctionUpdated(flatLogicFunction.id);
        await awsClient.clearFunctionCache(flatLogicFunction.id);

        return 'migrated';
      },
      getLambdaExecutorBuildLockKey(flatLogicFunction.id),
      {
        ttl: BUILD_LOCK_TTL_MS,
        ms: BUILD_LOCK_RETRY_MS,
        maxRetries: BUILD_LOCK_MAX_RETRIES,
      },
    );
  }

  private getLambdaDepsLayerServices(): LambdaDepsLayerServices {
    if (isDefined(this.lambdaDepsLayerServices)) {
      return this.lambdaDepsLayerServices;
    }

    const options = {
      ...getLambdaConnectionOptions(this.twentyConfigService),
      cacheStorageService: this.cacheStorageService,
    };
    const awsClient = new LambdaAwsClientService(options);

    this.lambdaDepsLayerServices = {
      awsClient,
      layerManager: new LambdaLayerManagerService(
        options,
        awsClient,
        new LambdaToolFunctionsService(options, awsClient),
        this.applicationDependencyFilesService,
        this.sdkClientArchiveService,
        this.cacheLockService,
        this.workspaceCacheService,
        this.coreEntityCacheService,
      ),
    };

    return this.lambdaDepsLayerServices;
  }
}
