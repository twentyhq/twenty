import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { FavoriteFolderWorkspaceEntity } from 'src/modules/favorite-folder/standard-objects/favorite-folder.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Command({
  name: 'upgrade:1-18:migrate-favorites-to-navigation-menu-items',
  description: 'Migrate favorites and favoriteFolders to navigationMenuItems',
})
export class MigrateFavoritesToNavigationMenuItemsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    MigrateFavoritesToNavigationMenuItemsCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Starting migration of favorites to navigation menu items for workspace ${workspaceId}`,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would migrate favorites to navigation menu items for workspace ${workspaceId}`,
      );

      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const folderIdMapping = await this.migrateFavoriteFolders({
      workspaceId,
      authContext,
      applicationId: workspaceCustomFlatApplication.id,
    });

    await this.migrateFavorites({
      workspaceId,
      authContext,
      applicationId: workspaceCustomFlatApplication.id,
      flatObjectMetadataMaps,
      folderIdMapping,
    });

    this.logger.log(
      `Successfully migrated favorites to navigation menu items for workspace ${workspaceId}`,
    );
  }

  private async migrateFavoriteFolders({
    workspaceId,
    authContext,
    applicationId,
  }: {
    workspaceId: string;
    authContext: ReturnType<typeof buildSystemAuthContext>;
    applicationId: string;
  }): Promise<Map<string, string>> {
    const favoriteFolderRepository =
      await this.twentyORMGlobalManager.getRepository<FavoriteFolderWorkspaceEntity>(
        workspaceId,
        'favoriteFolder',
        { shouldBypassPermissionChecks: true },
      );

    const favoriteFolders = await favoriteFolderRepository.find({
      order: { position: 'ASC' },
    });

    if (favoriteFolders.length === 0) {
      return new Map();
    }

    const folderIdMapping = new Map<string, string>();
    const flatNavigationMenuItemsToCreate: FlatNavigationMenuItem[] = [];

    for (const favoriteFolder of favoriteFolders) {
      const userWorkspaceId = await this.getUserWorkspaceIdFromFavoriteFolder(
        favoriteFolder.id,
        workspaceId,
        authContext,
      );

      const newId = uuidv4();
      const now = new Date().toISOString();

      folderIdMapping.set(favoriteFolder.id, newId);

      flatNavigationMenuItemsToCreate.push({
        id: newId,
        universalIdentifier: newId,
        userWorkspaceId,
        targetRecordId: null,
        targetObjectMetadataId: null,
        viewId: null,
        folderId: null,
        name: favoriteFolder.name,
        position: favoriteFolder.position,
        workspaceId,
        applicationId,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (flatNavigationMenuItemsToCreate.length > 0) {
      const { flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatNavigationMenuItemMaps',
        ]);

      await this.createNavigationMenuItems(
        workspaceId,
        flatNavigationMenuItemsToCreate,
        existingFlatNavigationMenuItemMaps,
      );
    }

    return folderIdMapping;
  }

  private async migrateFavorites({
    workspaceId,
    authContext,
    applicationId,
    flatObjectMetadataMaps,
    folderIdMapping,
  }: {
    workspaceId: string;
    authContext: ReturnType<typeof buildSystemAuthContext>;
    applicationId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    folderIdMapping: Map<string, string>;
  }): Promise<void> {
    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepository<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
        { shouldBypassPermissionChecks: true },
      );

    const favorites = await favoriteRepository.find({
      order: { position: 'ASC' },
    });

    if (favorites.length === 0) {
      return;
    }

    const { flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
      ]);

    const flatNavigationMenuItemsToCreate: FlatNavigationMenuItem[] = [];

    for (const favorite of favorites) {
      const userWorkspaceId = !isDefined(favorite.forWorkspaceMemberId)
        ? null
        : await this.getUserWorkspaceIdFromWorkspaceMemberId(
            favorite.forWorkspaceMemberId,
            workspaceId,
            authContext,
          );

      const folderId = favorite.favoriteFolderId
        ? (folderIdMapping.get(favorite.favoriteFolderId) ?? null)
        : null;

      if (isDefined(favorite.viewId)) {
        if (userWorkspaceId === null) {
          const existingItem = Object.values(
            existingFlatNavigationMenuItemMaps.byId,
          ).find(
            (item) =>
              isDefined(item) &&
              item.workspaceId === workspaceId &&
              item.userWorkspaceId === null &&
              item.viewId === favorite.viewId &&
              item.folderId === folderId,
          );

          if (isDefined(existingItem)) {
            this.logger.log(
              `Skipping favorite ${favorite.id} - workspace-level navigation menu item already exists for view ${favorite.viewId}`,
            );

            continue;
          }
        }

        const newId = uuidv4();
        const now = new Date().toISOString();

        flatNavigationMenuItemsToCreate.push({
          id: newId,
          universalIdentifier: newId,
          userWorkspaceId,
          targetRecordId: null,
          targetObjectMetadataId: null,
          viewId: favorite.viewId,
          folderId,
          name: null,
          position: favorite.position,
          workspaceId,
          applicationId,
          createdAt: now,
          updatedAt: now,
        });

        continue;
      }

      const { targetRecordId, targetObjectMetadataId } =
        await this.getTargetRecordFromFavorite(
          favorite,
          workspaceId,
          authContext,
          flatObjectMetadataMaps,
        );

      if (!isDefined(targetRecordId) || !isDefined(targetObjectMetadataId)) {
        this.logger.warn(
          `Skipping favorite ${favorite.id} - no valid target record found`,
        );

        continue;
      }

      if (userWorkspaceId === null) {
        const existingItem = Object.values(
          existingFlatNavigationMenuItemMaps.byId,
        ).find(
          (item) =>
            isDefined(item) &&
            item.workspaceId === workspaceId &&
            item.userWorkspaceId === null &&
            item.targetRecordId === targetRecordId &&
            item.targetObjectMetadataId === targetObjectMetadataId &&
            item.folderId === folderId,
        );

        if (isDefined(existingItem)) {
          this.logger.log(
            `Skipping favorite ${favorite.id} - workspace-level navigation menu item already exists for record ${targetRecordId}`,
          );

          continue;
        }
      }

      const newId = uuidv4();
      const now = new Date().toISOString();

      flatNavigationMenuItemsToCreate.push({
        id: newId,
        universalIdentifier: newId,
        userWorkspaceId,
        targetRecordId,
        targetObjectMetadataId,
        viewId: null,
        folderId,
        name: null,
        position: favorite.position,
        workspaceId,
        applicationId,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (flatNavigationMenuItemsToCreate.length > 0) {
      await this.createNavigationMenuItems(
        workspaceId,
        flatNavigationMenuItemsToCreate,
        existingFlatNavigationMenuItemMaps,
      );
    }
  }

  private async getUserWorkspaceIdFromFavoriteFolder(
    favoriteFolderId: string,
    workspaceId: string,
    authContext: ReturnType<typeof buildSystemAuthContext>,
  ): Promise<string | null> {
    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepository<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
        { shouldBypassPermissionChecks: true },
      );

    const firstFavorite = await favoriteRepository.findOne({
      where: { favoriteFolderId },
      order: { position: 'ASC' },
    });

    if (!isDefined(firstFavorite)) {
      return null;
    }

    if (!isDefined(firstFavorite.forWorkspaceMemberId)) {
      return null;
    }

    return this.getUserWorkspaceIdFromWorkspaceMemberId(
      firstFavorite.forWorkspaceMemberId,
      workspaceId,
      authContext,
    );
  }

  private async getUserWorkspaceIdFromWorkspaceMemberId(
    workspaceMemberId: string | null | undefined,
    workspaceId: string,
    authContext: ReturnType<typeof buildSystemAuthContext>,
  ): Promise<string | null> {
    if (!isDefined(workspaceMemberId)) {
      return null;
    }
    try {
      const workspaceMember =
        await this.twentyORMGlobalManager.executeInWorkspaceContext(
          authContext,
          async () => {
            const workspaceMemberRepository =
              await this.twentyORMGlobalManager.getRepository<WorkspaceMemberWorkspaceEntity>(
                workspaceId,
                'workspaceMember',
                { shouldBypassPermissionChecks: true },
              );

            return await workspaceMemberRepository.findOne({
              where: { id: workspaceMemberId },
            });
          },
        );

      if (!isDefined(workspaceMember)) {
        return null;
      }

      const userWorkspace =
        await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
          userId: workspaceMember.userId,
          workspaceId,
        });

      return userWorkspace.id;
    } catch (error) {
      this.logger.warn(
        `Failed to get userWorkspaceId for workspaceMemberId ${workspaceMemberId}: ${error}`,
      );

      return null;
    }
  }

  private async getTargetRecordFromFavorite(
    favorite: FavoriteWorkspaceEntity,
    workspaceId: string,
    authContext: ReturnType<typeof buildSystemAuthContext>,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  ): Promise<{
    targetRecordId: string | null;
    targetObjectMetadataId: string | null;
  }> {
    const relationFields = [
      { field: 'personId', objectName: 'person' },
      { field: 'companyId', objectName: 'company' },
      { field: 'opportunityId', objectName: 'opportunity' },
      { field: 'workflowId', objectName: 'workflow' },
      { field: 'workflowVersionId', objectName: 'workflowVersion' },
      { field: 'workflowRunId', objectName: 'workflowRun' },
      { field: 'taskId', objectName: 'task' },
      { field: 'noteId', objectName: 'note' },
      { field: 'dashboardId', objectName: 'dashboard' },
    ];

    for (const { field, objectName } of relationFields) {
      const recordId = (
        favorite as unknown as Record<string, string | undefined>
      )[field];

      if (isDefined(recordId)) {
        const objectMetadata = Object.values(flatObjectMetadataMaps.byId).find(
          (obj): obj is FlatObjectMetadata =>
            isDefined(obj) && obj.nameSingular === objectName,
        );

        if (isDefined(objectMetadata)) {
          return {
            targetRecordId: recordId,
            targetObjectMetadataId: objectMetadata.id,
          };
        }
      }
    }

    const customObjects = Object.values(flatObjectMetadataMaps.byId).filter(
      (obj): obj is FlatObjectMetadata =>
        isDefined(obj) && obj.isCustom === true,
    );

    for (const customObject of customObjects) {
      const customFieldName = `${customObject.nameSingular}Id`;
      const recordId = (
        favorite as unknown as Record<string, string | undefined>
      )[customFieldName];

      if (isDefined(recordId)) {
        return {
          targetRecordId: recordId,
          targetObjectMetadataId: customObject.id,
        };
      }
    }

    return { targetRecordId: null, targetObjectMetadataId: null };
  }

  private async createNavigationMenuItems(
    workspaceId: string,
    flatNavigationMenuItemsToCreate: FlatNavigationMenuItem[],
    _existingFlatNavigationMenuItemMaps: FlatNavigationMenuItemMaps,
  ): Promise<void> {
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: flatNavigationMenuItemsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: true,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new Error(
        `Failed to create navigation menu items: ${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatNavigationMenuItemMaps',
    ]);
  }
}
