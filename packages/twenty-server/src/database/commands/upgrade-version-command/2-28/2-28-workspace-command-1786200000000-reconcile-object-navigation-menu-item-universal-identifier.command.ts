import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildObjectNavigationMenuItemReownOperations } from 'src/database/commands/upgrade-version-command/2-28/utils/build-object-navigation-menu-item-reown-operations.util';
import { invalidateNavigationMenuItemReconcileCache } from 'src/database/commands/upgrade-version-command/2-28/utils/invalidate-navigation-menu-item-reconcile-cache.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@RegisteredWorkspaceCommand('2.28.0', 1786200000000)
@Command({
  name: 'upgrade:2-28:reconcile-object-navigation-menu-item-universal-identifier',
  description:
    'Re-own the workspace-level OBJECT navigation menu items (the sidebar rows) of the twenty-standard and workspace-custom objects onto the engine convention: the item gets the name-free deterministic universal identifier (getObjectNavigationMenuItemUniversalIdentifier, application identifier + object identifier) and isSystemSideEffect: true, as if provisioned by the metadata side-effect engine. Items of objects owned by an installed application are handled by the adopt-and-backfill command. position is left untouched, since renumbering would reorder the user sidebar, and user-scoped items (userWorkspaceId set) are left alone: they are user-owned and out of the engine scope. An object already holding several workspace-level OBJECT items keeps them all; exactly one is claimed for the engine, since the derived identifier is 1:1 per (application, object). Idempotent and retry-safe: an item already holding the derived identifier and the flag produces no update.',
})
export class ReconcileObjectNavigationMenuItemUniversalIdentifierCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationService: ApplicationService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(NavigationMenuItemEntity)
    private readonly navigationMenuItemRepository: Repository<NavigationMenuItemEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatNavigationMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const engineOwnedApplicationUniversalIdentifiers = new Set([
      twentyStandardFlatApplication.universalIdentifier,
      workspaceCustomFlatApplication.universalIdentifier,
    ]);

    const { updates, skippedObjectUniversalIdentifiers } =
      buildObjectNavigationMenuItemReownOperations({
        flatNavigationMenuItemMaps,
        flatObjectMetadataMaps,
        isFlatObjectMetadataInScope: (flatObjectMetadata) =>
          engineOwnedApplicationUniversalIdentifiers.has(
            flatObjectMetadata.applicationUniversalIdentifier,
          ),
      });

    for (const objectUniversalIdentifier of skippedObjectUniversalIdentifiers) {
      this.logger.warn(
        `Derived navigation menu item identifier of object ${objectUniversalIdentifier} is already held by another item in workspace ${workspaceId}, skipping`,
      );
    }

    if (updates.length === 0) {
      this.logger.log(
        `No object navigation menu item to reconcile for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling ${updates.length} object navigation menu item(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.navigationMenuItemRepository.manager.transaction(
      async (entityManager) => {
        const transactionalNavigationMenuItemRepository =
          entityManager.getRepository(NavigationMenuItemEntity);

        for (const { id, update } of updates) {
          await transactionalNavigationMenuItemRepository.update(
            { id, workspaceId },
            update,
          );
        }
      },
    );

    await invalidateNavigationMenuItemReconcileCache({
      workspaceId,
      workspaceMigrationRunnerService: this.workspaceMigrationRunnerService,
    });

    this.logger.log(
      `Reconciled ${updates.length} object navigation menu item(s) for workspace ${workspaceId}`,
    );
  }
}
