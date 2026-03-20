import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Command({
  name: 'upgrade:1-20:delete-orphan-navigation-menu-items',
  description:
    'Delete orphan navigation menu items and normalize favorite positions',
})
export class DeleteOrphanNavigationMenuItemsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    DeleteOrphanNavigationMenuItemsCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(NavigationMenuItemEntity)
    private readonly navigationMenuItemRepository: Repository<NavigationMenuItemEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatViewMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewMaps',
        'flatObjectMetadataMaps',
      ]);

    const navigationMenuItems = await this.navigationMenuItemRepository.find({
      where: { workspaceId },
      order: { position: 'ASC', createdAt: 'ASC', id: 'ASC' },
    });

    if (navigationMenuItems.length === 0) {
      return;
    }

    const activeViewIds = new Set(
      Object.values(flatViewMaps.byUniversalIdentifier)
        .filter((view): view is NonNullable<typeof view> => isDefined(view))
        .filter((view) => view.deletedAt === null)
        .map((view) => view.id),
    );

    const folderIds = new Set(
      navigationMenuItems
        .filter(
          (item) =>
            isDefined(item.name) &&
            !isDefined(item.link) &&
            !isDefined(item.viewId) &&
            !isDefined(item.targetRecordId) &&
            !isDefined(item.targetObjectMetadataId),
        )
        .map((item) => item.id),
    );

    const orphanViewItemIds = navigationMenuItems
      .filter(
        (item) =>
          isDefined(item.viewId) && !activeViewIds.has(item.viewId as string),
      )
      .map((item) => item.id);

    const orphanFolderItemIds = navigationMenuItems
      .filter(
        (item) =>
          isDefined(item.folderId) && !folderIds.has(item.folderId as string),
      )
      .map((item) => item.id);

    const orphanRecordItemIds = await this.findOrphanRecordNavigationMenuItemIds(
      workspaceId,
      navigationMenuItems,
      flatObjectMetadataMaps,
    );

    const orphanNavigationMenuItemIds = Array.from(
      new Set([
        ...orphanViewItemIds,
        ...orphanFolderItemIds,
        ...orphanRecordItemIds,
      ]),
    );

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would delete ${orphanNavigationMenuItemIds.length} orphan navigation menu item(s) for workspace ${workspaceId}`,
      );
      return;
    }

    if (orphanNavigationMenuItemIds.length > 0) {
      await this.navigationMenuItemRepository.delete({
        workspaceId,
        id: In(orphanNavigationMenuItemIds),
      });

      this.logger.log(
        `Deleted ${orphanNavigationMenuItemIds.length} orphan navigation menu item(s) for workspace ${workspaceId}`,
      );
    }

    await this.normalizeNavigationMenuItemPositions(workspaceId);
    await this.workspaceCacheService.flush(workspaceId, [
      'flatNavigationMenuItemMaps',
    ]);
  }

  private async findOrphanRecordNavigationMenuItemIds(
    workspaceId: string,
    navigationMenuItems: NavigationMenuItemEntity[],
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  ): Promise<string[]> {
    const authContext = buildSystemAuthContext(workspaceId);
    const navigationMenuItemIdsToDelete: string[] = [];
    const itemIdsByObjectMetadataId = new Map<string, string[]>();
    const recordIdsByObjectMetadataId = new Map<string, string[]>();

    for (const item of navigationMenuItems) {
      if (
        !isDefined(item.targetRecordId) ||
        !isDefined(item.targetObjectMetadataId)
      ) {
        continue;
      }

      const existingItemIds =
        itemIdsByObjectMetadataId.get(item.targetObjectMetadataId) ?? [];
      existingItemIds.push(item.id);
      itemIdsByObjectMetadataId.set(item.targetObjectMetadataId, existingItemIds);

      const existingRecordIds =
        recordIdsByObjectMetadataId.get(item.targetObjectMetadataId) ?? [];
      existingRecordIds.push(item.targetRecordId);
      recordIdsByObjectMetadataId.set(
        item.targetObjectMetadataId,
        existingRecordIds,
      );
    }

    for (const [
      objectMetadataId,
      targetRecordIds,
    ] of recordIdsByObjectMetadataId.entries()) {
      const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(objectMetadata)) {
        navigationMenuItemIdsToDelete.push(
          ...(itemIdsByObjectMetadataId.get(objectMetadataId) ?? []),
        );
        continue;
      }

      const existingRecordIds =
        await this.twentyORMGlobalManager.executeInWorkspaceContext(
          async () => {
            const repository = await this.twentyORMGlobalManager.getRepository(
              workspaceId,
              objectMetadata.nameSingular,
              { shouldBypassPermissionChecks: true },
            );

            const records = await repository.find({
              select: { id: true },
              where: {
                id: In(targetRecordIds),
              },
            });

            return new Set(records.map((record) => record.id));
          },
          authContext,
        );

      for (const item of navigationMenuItems) {
        if (item.targetObjectMetadataId !== objectMetadataId) {
          continue;
        }

        if (
          isDefined(item.targetRecordId) &&
          !existingRecordIds.has(item.targetRecordId)
        ) {
          navigationMenuItemIdsToDelete.push(item.id);
        }
      }
    }

    return navigationMenuItemIdsToDelete;
  }

  private async normalizeNavigationMenuItemPositions(
    workspaceId: string,
  ): Promise<void> {
    const navigationMenuItems = await this.navigationMenuItemRepository.find({
      where: { workspaceId },
      order: { position: 'ASC', createdAt: 'ASC', id: 'ASC' },
    });

    const itemsByScope = new Map<string, NavigationMenuItemEntity[]>();

    for (const item of navigationMenuItems) {
      const scopeKey = `${item.userWorkspaceId ?? 'workspace'}:${item.folderId ?? 'root'}`;
      const scopedItems = itemsByScope.get(scopeKey) ?? [];
      scopedItems.push(item);
      itemsByScope.set(scopeKey, scopedItems);
    }

    for (const scopedItems of itemsByScope.values()) {
      for (const [index, item] of scopedItems.entries()) {
        if (item.position === index) {
          continue;
        }

        await this.navigationMenuItemRepository.update(
          { workspaceId, id: item.id },
          { position: index },
        );
      }
    }
  }
}
