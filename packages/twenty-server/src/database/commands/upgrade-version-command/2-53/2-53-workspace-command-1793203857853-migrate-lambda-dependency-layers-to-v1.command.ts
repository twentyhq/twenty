import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { migrateLambdaFunctionDepsLayer } from 'src/database/commands/upgrade-version-command/2-53/utils/migrate-lambda-function-deps-layer.util';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-layer-manager.service';
import { LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { getLambdaConnectionOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-connection-options.util';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type LambdaDepsLayerServices = {
  awsClient: LambdaAwsClientService;
  layerManager: LambdaLayerManagerService;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

@RegisteredWorkspaceCommand('2.53.0', 1793203857853)
@Command({
  name: 'upgrade:2-53:migrate-lambda-dependency-layers-to-v1',
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
    const { awsClient, layerManager } = this.getLambdaDepsLayerServices();

    const { flatApplicationMaps, flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
        'flatLogicFunctionMaps',
      ]);

    let migratedCount = 0;
    let failedCount = 0;

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
        const isMigrated = await migrateLambdaFunctionDepsLayer({
          awsClient,
          layerManager,
          cacheLockService: this.cacheLockService,
          flatLogicFunction,
          flatApplication,
        });

        if (isMigrated) {
          migratedCount++;
        }
      } catch (error) {
        failedCount++;
        this.logger.error(
          `Logic function ${flatLogicFunction.id} in workspace ${workspaceId} stays on its legacy dependency layer: ${getErrorMessage(error)}`,
        );
      }
    }

    this.logger.log(
      `Moved ${migratedCount} logic function(s) to their v1 dependency layer in workspace ${workspaceId}, ${failedCount} failed`,
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
