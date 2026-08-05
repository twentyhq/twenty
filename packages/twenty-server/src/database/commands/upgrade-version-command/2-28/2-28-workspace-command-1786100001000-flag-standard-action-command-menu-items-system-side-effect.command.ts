import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { invalidateCommandMenuItemReownCache } from 'src/database/commands/upgrade-version-command/2-28/utils/invalidate-command-menu-item-reown-cache.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const STANDARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = Object.values(
  STANDARD_COMMAND_MENU_ITEMS,
).map((definition) => definition.universalIdentifier);

@RegisteredWorkspaceCommand('2.28.0', 1786100001000)
@Command({
  name: 'upgrade:2-28:flag-standard-action-command-menu-items-system-side-effect',
  description:
    'Set isSystemSideEffect: true on the standard action command menu items (delete / restore / export / merge / import / workflow actions / settings navigation / ...), matched by their STANDARD_COMMAND_MENU_ITEMS literal universal identifiers. The flag excludes these engine-authored singletons from manifest deletion inference and lets the flat command menu item validator reject an app manifest authoring a row on one of their identifiers. Universal identifiers are NOT converged onto the derivation helpers: the (availabilityType, engineComponentKey) keying collapses the 17 path-based GLOBAL NAVIGATION entries onto one identifier and FALLBACK has no helper, so the literal identifiers stay. Rows derived from user-created workflows and prefilled app front components deliberately keep isSystemSideEffect: false: they are not produced by a metadata operation. Idempotent.',
})
export class FlagStandardActionCommandMenuItemsSystemSideEffectCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const commandMenuItemIdsToFlag =
      STANDARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          flatCommandMenuItemMaps.byUniversalIdentifier[universalIdentifier],
      )
        .filter(isDefined)
        .filter(
          (flatCommandMenuItem) => !flatCommandMenuItem.isSystemSideEffect,
        )
        .map((flatCommandMenuItem) => flatCommandMenuItem.id);

    if (commandMenuItemIdsToFlag.length === 0) {
      this.logger.log(
        `No standard action command menu item to flag for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Flagging ${commandMenuItemIdsToFlag.length} standard action command menu item(s) isSystemSideEffect for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.commandMenuItemRepository.manager.transaction(
      async (entityManager) => {
        const transactionalCommandMenuItemRepository =
          entityManager.getRepository(CommandMenuItemEntity);

        for (const commandMenuItemId of commandMenuItemIdsToFlag) {
          await transactionalCommandMenuItemRepository.update(
            { id: commandMenuItemId, workspaceId },
            { isSystemSideEffect: true },
          );
        }
      },
    );

    await invalidateCommandMenuItemReownCache({
      workspaceId,
      workspaceMigrationRunnerService: this.workspaceMigrationRunnerService,
    });

    this.logger.log(
      `Flagged ${commandMenuItemIdsToFlag.length} standard action command menu item(s) isSystemSideEffect for workspace ${workspaceId}`,
    );
  }
}
