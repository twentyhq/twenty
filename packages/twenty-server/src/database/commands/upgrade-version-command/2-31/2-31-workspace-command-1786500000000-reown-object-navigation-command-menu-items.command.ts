import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { getNavigationCommandUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { invalidateCommandMenuItemReownCache } from 'src/database/commands/upgrade-version-command/2-31/utils/invalidate-command-menu-item-reown-cache.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
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

@RegisteredWorkspaceCommand('2.31.0', 1786500000000)
@Command({
  name: 'upgrade:2-31:reown-object-navigation-command-menu-items',
  description:
    'Re-own the object navigation command menu items (engineComponentKey NAVIGATION with an { objectMetadataItemId } payload) onto the derived (application, object) universal identifier (getNavigationCommandUniversalIdentifier, keyed on the application of the target object), retiring the bespoke v5 namespace derivation that was keyed on the object alone. Only universalIdentifier changes (plus isSystemSideEffect for legacy rows still carrying false): position, isPinned, hotKeys and overrides are left untouched so the re-own is workspace-invisible. Path-based NAVIGATION commands (payload: { path }) share the engine key but are not object-keyed and are not touched. Idempotent: rows already holding their derived identifier only get the flag reconciled, and a derived identifier already held by another row is skipped with a warning.',
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
    const claimedUniversalIdentifiers = new Set<string>();

    for (const flatCommandMenuItem of Object.values(
      flatCommandMenuItemMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatCommandMenuItem) ||
        flatCommandMenuItem.engineComponentKey !==
          EngineComponentKey.NAVIGATION ||
        !isObjectMetadataCommandMenuItemPayload(flatCommandMenuItem.payload)
      ) {
        continue;
      }

      const objectMetadataUniversalIdentifier =
        flatObjectMetadataMaps.universalIdentifierById[
          flatCommandMenuItem.payload.objectMetadataItemId
        ];
      const flatObjectMetadata = isDefined(objectMetadataUniversalIdentifier)
        ? flatObjectMetadataMaps.byUniversalIdentifier[
            objectMetadataUniversalIdentifier
          ]
        : undefined;

      if (!isDefined(flatObjectMetadata)) {
        this.logger.warn(
          `Missing object for navigation command menu item ${flatCommandMenuItem.id} in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      const derivedUniversalIdentifier = getNavigationCommandUniversalIdentifier(
        {
          applicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        },
      );

      if (
        flatCommandMenuItem.universalIdentifier === derivedUniversalIdentifier
      ) {
        claimedUniversalIdentifiers.add(derivedUniversalIdentifier);

        if (!flatCommandMenuItem.isSystemSideEffect) {
          commandMenuItemUpdates.push({
            id: flatCommandMenuItem.id,
            update: { isSystemSideEffect: true },
          });
        }
        continue;
      }

      // Any holder of the derived identifier makes the re-own impossible:
      // universalIdentifier is unique per workspace.
      const isDerivedUniversalIdentifierTaken =
        isDefined(
          flatCommandMenuItemMaps.byUniversalIdentifier[
            derivedUniversalIdentifier
          ],
        ) || claimedUniversalIdentifiers.has(derivedUniversalIdentifier);

      if (isDerivedUniversalIdentifierTaken) {
        this.logger.warn(
          `Derived identifier ${derivedUniversalIdentifier} of navigation command menu item ${flatCommandMenuItem.id} is already held by another command menu item in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      claimedUniversalIdentifiers.add(derivedUniversalIdentifier);

      const update: ReownUpdate['update'] = {
        universalIdentifier: derivedUniversalIdentifier,
      };

      if (!flatCommandMenuItem.isSystemSideEffect) {
        update.isSystemSideEffect = true;
      }

      commandMenuItemUpdates.push({ id: flatCommandMenuItem.id, update });
    }

    return commandMenuItemUpdates;
  }
}
