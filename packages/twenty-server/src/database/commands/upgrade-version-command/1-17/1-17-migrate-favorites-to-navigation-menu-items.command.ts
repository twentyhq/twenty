import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { FavoriteFolderWorkspaceEntity } from 'src/modules/favorite-folder/standard-objects/favorite-folder.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Command({
  name: 'upgrade:1-17:migrate-favorites-to-navigation-menu-items',
  description: 'Migrate favorites and favoriteFolders to navigationMenuItems',
})
export class MigrateFavoritesToNavigationMenuItemsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    MigrateFavoritesToNavigationMenuItemsCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly featureFlagService: FeatureFlagService,
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

    const isNavigationMenuItemEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_ENABLED,
        workspaceId,
      );

    if (isNavigationMenuItemEnabled) {
      this.logger.log(
        `Navigation menu item feature flag is already enabled for workspace ${workspaceId}. Skipping migration.`,
      );

      return;
    }

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

    const { flatObjectMetadataMaps, flatViewMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatViewMaps',
      ]);

    const folderIdMapping = await this.migrateFavoriteFolders({
      workspaceId,
      applicationId: workspaceCustomFlatApplication.id,
    });

    const migratedFavoriteIds = await this.migrateFavorites({
      workspaceId,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      flatObjectMetadataMaps,
      flatViewMaps,
      folderIdMapping,
    });

    await this.softDeleteMigratedFavorites({
      workspaceId,
      favoriteIds: migratedFavoriteIds,
    });

    await this.softDeleteMigratedFavoriteFolders({
      workspaceId,
      favoriteFolderIds: Array.from(folderIdMapping.keys()),
    });

    await this.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId,
      featureFlag: FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_ENABLED,
      value: true,
    });

    this.logger.log(
      `Successfully migrated favorites to navigation menu items for workspace ${workspaceId}`,
    );
  }

  private async migrateFavoriteFolders({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<Map<string, string>> {
    const favoriteFolderRepository =
      await this.twentyORMGlobalManager.getRepository<FavoriteFolderWorkspaceEntity>(
        workspaceId,
        'favoriteFolder',
        { shouldBypassPermissionChecks: true },
      );

    const favoriteFolders = await favoriteFolderRepository.find({
      where: { deletedAt: IsNull() },
      order: { position: 'ASC' },
    });

    if (favoriteFolders.length === 0) {
      return new Map();
    }

    const { flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
      ]);

    const folderIdMapping = new Map<string, string>();
    const flatNavigationMenuItemsToCreate: FlatNavigationMenuItem[] = [];

    for (const favoriteFolder of favoriteFolders) {
      const existingFolder =
        existingFlatNavigationMenuItemMaps.byId[favoriteFolder.id];

      if (isDefined(existingFolder)) {
        this.logger.log(
          `Skipping favorite folder ${favoriteFolder.id} - navigation menu item folder already migrated`,
        );

        folderIdMapping.set(favoriteFolder.id, existingFolder.id);

        continue;
      }

      const now = new Date().toISOString();

      folderIdMapping.set(favoriteFolder.id, favoriteFolder.id);

      const folderToCreate = {
        id: favoriteFolder.id,
        universalIdentifier: favoriteFolder.id,
        userWorkspaceId: null,
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
      };

      flatNavigationMenuItemsToCreate.push(folderToCreate);
    }

    if (flatNavigationMenuItemsToCreate.length > 0) {
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
    workspaceCustomApplicationId,
    flatObjectMetadataMaps,
    flatViewMaps,
    folderIdMapping,
  }: {
    workspaceId: string;
    workspaceCustomApplicationId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatViewMaps: FlatEntityMaps<FlatView>;
    folderIdMapping: Map<string, string>;
  }): Promise<string[]> {
    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepository<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
        { shouldBypassPermissionChecks: true },
      );

    const favorites = await favoriteRepository.find({
      where: { deletedAt: IsNull() },
      order: { position: 'ASC' },
    });

    if (favorites.length === 0) {
      return [];
    }

    const { flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
      ]);

    const favoriteObjectMetadata = await this.objectMetadataRepository.findOne({
      where: {
        nameSingular: 'favorite',
        workspaceId,
      },
    });

    if (!favoriteObjectMetadata) {
      throw new Error('Favorite object metadata not found');
    }

    const favoriteRelationFields = await this.fieldMetadataRepository.find({
      where: {
        objectMetadataId: favoriteObjectMetadata.id,
        type: FieldMetadataType.RELATION,
      },
    });

    const favoriteRelationFieldMap = new Map<
      string,
      { name: string; relationTargetUniversalIdentifier: string }
    >();

    for (const field of favoriteRelationFields) {
      if (
        field.name !== 'forWorkspaceMember' &&
        field.name !== 'favoriteFolder' &&
        isDefined(field.relationTargetObjectMetadataId)
      ) {
        const targetObjectMetadata =
          flatObjectMetadataMaps.byId[field.relationTargetObjectMetadataId];

        if (isDefined(targetObjectMetadata)) {
          favoriteRelationFieldMap.set(field.name, {
            name: field.name,
            relationTargetUniversalIdentifier:
              targetObjectMetadata.universalIdentifier,
          });
        }
      }
    }

    const flatNavigationMenuItemsToCreate: FlatNavigationMenuItem[] = [];
    const migratedFavoriteIds: string[] = [];

    for (const favorite of favorites) {
      const userWorkspaceId = !isDefined(favorite.forWorkspaceMemberId)
        ? null
        : await this.getUserWorkspaceIdFromWorkspaceMemberId(
            favorite.forWorkspaceMemberId,
            workspaceId,
          );

      if (
        isDefined(favorite.forWorkspaceMemberId) &&
        !isDefined(userWorkspaceId)
      ) {
        this.logger.warn(
          `Skipping favorite ${favorite.id} - forWorkspaceMemberId ${favorite.forWorkspaceMemberId} did not resolve to a userWorkspaceId`,
        );

        continue;
      }

      const folderId = favorite.favoriteFolderId
        ? (folderIdMapping.get(favorite.favoriteFolderId) ?? null)
        : null;

      if (isDefined(favorite.viewId)) {
        const existingItem = Object.values(
          existingFlatNavigationMenuItemMaps.byId,
        ).find(
          (item) =>
            isDefined(item) &&
            item.workspaceId === workspaceId &&
            item.userWorkspaceId === userWorkspaceId &&
            item.viewId === favorite.viewId &&
            item.folderId === folderId,
        );

        if (isDefined(existingItem)) {
          this.logger.log(
            `Skipping favorite ${favorite.id} - navigation menu item already exists for view ${favorite.viewId}`,
          );

          continue;
        }

        let applicationId = workspaceCustomApplicationId;

        if (userWorkspaceId === null) {
          try {
            const flatView = findFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityMaps: flatViewMaps,
              flatEntityId: favorite.viewId,
            });

            applicationId =
              flatView.applicationId ?? workspaceCustomApplicationId;
          } catch {
            this.logger.warn(
              `Could not find view ${favorite.viewId} in flatViewMaps, using workspace custom application ID`,
            );
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

        migratedFavoriteIds.push(favorite.id);

        continue;
      }

      const { targetRecordId, targetObjectMetadataId } =
        this.getTargetRecordFromFavorite(
          favorite,
          flatObjectMetadataMaps,
          favoriteRelationFieldMap,
        );

      if (!isDefined(targetRecordId) || !isDefined(targetObjectMetadataId)) {
        this.logger.warn(
          `Skipping favorite ${favorite.id} - no valid target record found`,
        );

        continue;
      }

      const existingItem = existingFlatNavigationMenuItemMaps.byId[favorite.id];

      if (isDefined(existingItem)) {
        this.logger.log(
          `Skipping favorite ${favorite.id} - navigation menu item already migrated`,
        );

        continue;
      }

      const now = new Date().toISOString();

      flatNavigationMenuItemsToCreate.push({
        id: favorite.id,
        universalIdentifier: favorite.id,
        userWorkspaceId,
        targetRecordId,
        targetObjectMetadataId,
        viewId: null,
        folderId,
        name: null,
        position: favorite.position,
        workspaceId,
        applicationId: workspaceCustomApplicationId,
        createdAt: now,
        updatedAt: now,
      });

      migratedFavoriteIds.push(favorite.id);
    }

    if (flatNavigationMenuItemsToCreate.length > 0) {
      await this.createNavigationMenuItems(
        workspaceId,
        flatNavigationMenuItemsToCreate,
        existingFlatNavigationMenuItemMaps,
      );
    }

    return migratedFavoriteIds;
  }

  private async getUserWorkspaceIdFromWorkspaceMemberId(
    workspaceMemberId: string | null | undefined,
    workspaceId: string,
  ): Promise<string | null> {
    if (!isDefined(workspaceMemberId)) {
      return null;
    }
    const authContext = buildSystemAuthContext(workspaceId);

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

  private getTargetRecordFromFavorite(
    favorite: FavoriteWorkspaceEntity,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    favoriteRelationFieldMap: Map<
      string,
      { name: string; relationTargetUniversalIdentifier: string }
    >,
  ): {
    targetRecordId: string | null;
    targetObjectMetadataId: string | null;
  } {
    for (const [
      fieldName,
      { relationTargetUniversalIdentifier },
    ] of favoriteRelationFieldMap.entries()) {
      const fieldIdName = `${fieldName}Id`;
      const recordId = (
        favorite as unknown as Record<string, string | undefined>
      )[fieldIdName];

      if (!isDefined(recordId)) {
        continue;
      }

      const targetObjectMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: relationTargetUniversalIdentifier,
      });

      if (isDefined(targetObjectMetadata)) {
        return {
          targetRecordId: recordId,
          targetObjectMetadataId: targetObjectMetadata.id,
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
  }

  private async softDeleteMigratedFavorites({
    workspaceId,
    favoriteIds,
  }: {
    workspaceId: string;
    favoriteIds: string[];
  }): Promise<void> {
    if (favoriteIds.length === 0) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.twentyORMGlobalManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const favoriteRepository =
          await this.twentyORMGlobalManager.getRepository<FavoriteWorkspaceEntity>(
            workspaceId,
            'favorite',
            { shouldBypassPermissionChecks: true },
          );

        await favoriteRepository.softDelete(favoriteIds);
      },
    );
  }

  private async softDeleteMigratedFavoriteFolders({
    workspaceId,
    favoriteFolderIds,
  }: {
    workspaceId: string;
    favoriteFolderIds: string[];
  }): Promise<void> {
    if (favoriteFolderIds.length === 0) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.twentyORMGlobalManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const favoriteFolderRepository =
          await this.twentyORMGlobalManager.getRepository<FavoriteFolderWorkspaceEntity>(
            workspaceId,
            'favoriteFolder',
            { shouldBypassPermissionChecks: true },
          );

        await favoriteFolderRepository.softDelete(favoriteFolderIds);
      },
    );
  }
}
