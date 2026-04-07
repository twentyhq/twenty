import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Command({
  name: 'upgrade:1-20:delete-orphan-navigation-menu-items',
  description: 'Delete navigation menu items pointing to deleted views',
})
export class DeleteOrphanNavigationMenuItemsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectRepository(NavigationMenuItemEntity)
    private readonly navigationMenuItemRepository: Repository<NavigationMenuItemEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatViewMaps, flatNavigationMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewMaps',
        'flatNavigationMenuItemMaps',
      ]);

    const activeViewIds = new Set(
      Object.values(flatViewMaps.byUniversalIdentifier)
        .filter((view): view is NonNullable<typeof view> => isDefined(view))
        .filter((view) => view.deletedAt === null)
        .map((view) => view.id),
    );

    const orphanViewNavigationMenuItemIds = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    )
      .filter(
        (item): item is NonNullable<typeof item> =>
          isDefined(item) &&
          item.type === NavigationMenuItemType.VIEW &&
          isDefined(item.viewId) &&
          !activeViewIds.has(item.viewId),
      )
      .map((item) => item.id);

    if (orphanViewNavigationMenuItemIds.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would delete ${orphanViewNavigationMenuItemIds.length} orphan navigation menu item(s) for workspace ${workspaceId}`,
      );
      return;
    }

    await this.navigationMenuItemRepository.delete({
      workspaceId,
      id: In(orphanViewNavigationMenuItemIds),
    });

    this.logger.log(
      `Deleted ${orphanViewNavigationMenuItemIds.length} orphan navigation menu item(s) for workspace ${workspaceId}`,
    );

    await this.workspaceCacheService.flush(workspaceId, [
      'flatNavigationMenuItemMaps',
    ]);
  }
}
