import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { typedObjectEntries } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMissingStandardCommandMenuItemsToCreate } from 'src/database/commands/upgrade-version-command/2-39/utils/build-missing-standard-command-menu-items-to-create.util';
import { applyObjectNavigationCommandMenuItemRepairs } from 'src/database/commands/upgrade-version-command/2-61/utils/apply-object-navigation-command-menu-item-repairs.util';
import { buildObjectNavigationCommandMenuItemRepairs } from 'src/database/commands/upgrade-version-command/2-61/utils/build-object-navigation-command-menu-item-repairs.util';
import { buildStandardCommandMenuItemAvailabilityUpdates } from 'src/database/commands/upgrade-version-command/2-61/utils/build-standard-command-menu-item-availability-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const STANDARD_COMMAND_MENU_ITEM_NAMES = typedObjectEntries(
  STANDARD_COMMAND_MENU_ITEMS,
).map(([name]) => name);

@RegisteredWorkspaceCommand('2.61.0', 1795103130063)
@Command({
  name: 'upgrade:2-61:repair-skipped-standard-command-menu-items',
  description:
    'Repair command menu items that earlier commands completed without touching: object navigation commands left on the legacy identifier with no target object (Go to Campaigns, Lists and List members), standard commands whose availability expression drifted from the standard application, and standard commands that were never backfilled (Retry on workflow runs). Position, pinning, hot keys and overrides are untouched.',
})
export class RepairSkippedStandardCommandMenuItemsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(CommandMenuItemEntity)
    private readonly commandMenuItemRepository: Repository<CommandMenuItemEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    await this.repairObjectNavigationCommands({ workspaceId, isDryRun });
    await this.syncStandardCommands({ workspaceId, isDryRun });
  }

  private async syncStandardCommands({
    workspaceId,
    isDryRun,
  }: {
    workspaceId: string;
    isDryRun: boolean;
  }): Promise<void> {
    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const now = new Date().toISOString();

    const flatEntityToUpdate = buildStandardCommandMenuItemAvailabilityUpdates({
      flatCommandMenuItemMaps,
      now,
    });

    const flatEntityToCreate = buildMissingStandardCommandMenuItemsToCreate({
      commandMenuItemNames: STANDARD_COMMAND_MENU_ITEM_NAMES,
      flatCommandMenuItemByUniversalIdentifier:
        flatCommandMenuItemMaps.byUniversalIdentifier,
      flatObjectMetadataMaps,
      workspaceId,
      now,
    });

    if (flatEntityToUpdate.length === 0 && flatEntityToCreate.length === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: resyncing ${flatEntityToUpdate.length} standard command availability expression(s) and creating ${flatEntityToCreate.length} missing standard command(s)`,
    );

    if (isDryRun) {
      return;
    }

    const validateBuildAndRunResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate,
            },
          },
        },
      );

    if (validateBuildAndRunResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(validateBuildAndRunResult);
    }
  }

  // A workspace migration cannot change a universal identifier, so write rows directly
  private async repairObjectNavigationCommands({
    workspaceId,
    isDryRun,
  }: {
    workspaceId: string;
    isDryRun: boolean;
  }): Promise<void> {
    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const repairs = buildObjectNavigationCommandMenuItemRepairs({
      flatCommandMenuItemMaps,
      flatObjectMetadataMaps,
    });

    if (repairs.length === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: repairing ${repairs.length} object navigation command(s)`,
    );

    if (isDryRun) {
      return;
    }

    await applyObjectNavigationCommandMenuItemRepairs({
      workspaceId,
      repairs,
      commandMenuItemRepository: this.commandMenuItemRepository,
      workspaceMigrationRunnerService: this.workspaceMigrationRunnerService,
    });
  }
}
