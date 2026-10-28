import { Inject } from '@nestjs/common';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

@RegisteredWorkspaceCommand('2.53.0', 1793182807954)
@Command({
  name: 'upgrade:2-53:migrate-lambda-dependency-layers-to-v1',
  description:
    'Recompute application dependency checksums from the stored files and move logic functions to their v1 dependency layer',
})
export class MigrateLambdaDependencyLayersToV1Command extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly applicationDependencyFilesService: ApplicationDependencyFilesService,
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun === true;

    await this.backfillDependencyChecksums({ workspaceId, isDryRun });

    if (isDryRun) {
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
    const driver = this.logicFunctionDriverFactory.getCurrentDriver();

    if (!isDefined(driver.migrateDepsLayer)) {
      return;
    }

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
        const isMigrated = await driver.migrateDepsLayer({
          flatLogicFunction,
          flatApplication,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
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
}
