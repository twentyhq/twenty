import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { getSystemNavigationCommandMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { invalidateCommandMenuItemReownCache } from 'src/database/commands/upgrade-version-command/2-38/utils/invalidate-command-menu-item-reown-cache.util';
import { getLegacyNavigationCommandUniversalIdentifier } from 'src/database/commands/upgrade-version-command/utils/build-legacy-navigation-flat-command-menu-item.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

type ReownUpdate = {
  id: string;
  update: {
    universalIdentifier?: string;
    isSystemSideEffect?: boolean;
  };
};

@RegisteredWorkspaceCommand('2.38.0', 1788166853000)
@Command({
  name: 'upgrade:2-38:reown-object-navigation-command-menu-items',
  description:
    'Move the object navigation command menu items off the retired v5 namespace derivation, which was keyed on the object alone, onto the derived (application, object) universal identifier. Walks objects rather than command menu items and takes only the row sitting on the legacy identifier of the object and belonging to the same application as that object, so a command an application authored for an object is never adopted. Only universalIdentifier changes, plus isSystemSideEffect for rows the 2.12 backfill left false because they belong to the workspace custom application: position, isPinned, hotKeys and overrides are untouched so the re-own is workspace-invisible. Idempotent, since a converged object no longer has a row on its legacy identifier. A derived identifier already held by another row keeps its holder, the legacy row keeps its identifier with a warning, and the flag is still reconciled.',
})
export class ReownObjectNavigationCommandMenuItemsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
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

    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const commandMenuItemUpdates = this.computeReownUpdates({
      workspaceId,
      flatCommandMenuItemMaps,
      flatObjectMetadataMaps,
    });

    if (commandMenuItemUpdates.length === 0) {
      this.logger.log(
        `No object navigation command menu item to re-own for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Re-owning ${commandMenuItemUpdates.length} object navigation command menu item(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.commandMenuItemRepository.manager.transaction(
      async (entityManager) => {
        const transactionalCommandMenuItemRepository =
          entityManager.getRepository(CommandMenuItemEntity);

        for (const { id, update } of commandMenuItemUpdates) {
          await transactionalCommandMenuItemRepository.update(
            { id, workspaceId },
            update,
          );
        }
      },
    );

    await invalidateCommandMenuItemReownCache({
      workspaceId,
      workspaceMigrationRunnerService: this.workspaceMigrationRunnerService,
    });

    this.logger.log(
      `Re-owned ${commandMenuItemUpdates.length} object navigation command menu item(s) for workspace ${workspaceId}`,
    );
  }

  private computeReownUpdates({
    workspaceId,
    flatCommandMenuItemMaps,
    flatObjectMetadataMaps,
  }: {
    workspaceId: string;
    flatCommandMenuItemMaps: AllFlatEntityMaps['flatCommandMenuItemMaps'];
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
  }): ReownUpdate[] {
    const commandMenuItemUpdates: ReownUpdate[] = [];

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatObjectMetadata)) {
        continue;
      }

      const legacyFlatCommandMenuItem =
        flatCommandMenuItemMaps.byUniversalIdentifier[
          getLegacyNavigationCommandUniversalIdentifier(
            flatObjectMetadata.universalIdentifier,
          )
        ];

      if (
        !isDefined(legacyFlatCommandMenuItem) ||
        legacyFlatCommandMenuItem.applicationUniversalIdentifier !==
          flatObjectMetadata.applicationUniversalIdentifier
      ) {
        continue;
      }

      const derivedUniversalIdentifier =
        getSystemNavigationCommandMenuItemUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        });

      const update: ReownUpdate['update'] = {};

      if (!legacyFlatCommandMenuItem.isSystemSideEffect) {
        update.isSystemSideEffect = true;
      }

      if (
        isDefined(
          flatCommandMenuItemMaps.byUniversalIdentifier[
            derivedUniversalIdentifier
          ],
        )
      ) {
        this.logger.warn(
          `Derived identifier ${derivedUniversalIdentifier} of navigation command menu item ${legacyFlatCommandMenuItem.id} is already held by another command menu item in workspace ${workspaceId}, keeping its identifier`,
        );
      } else {
        update.universalIdentifier = derivedUniversalIdentifier;
      }

      if (Object.keys(update).length > 0) {
        commandMenuItemUpdates.push({
          id: legacyFlatCommandMenuItem.id,
          update,
        });
      }
    }

    return commandMenuItemUpdates;
  }
}
