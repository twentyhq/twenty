import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not, Or, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { FavoriteFolderWorkspaceEntity } from 'src/modules/favorite-folder/standard-objects/favorite-folder.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const WORKSPACE_LEVEL = 'workspace-level';

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

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const {
      flatObjectMetadataMaps,
      flatViewMaps,
      flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatViewMaps',
      'flatNavigationMenuItemMaps',
      'flatFieldMetadataMaps',
    ]);

    const {
      folderIdMapping,
      flatNavigationMenuItemsToCreate: folderNavItemsToCreate,
    } = await this.migrateFavoriteFolders({
      workspaceId,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      existingFlatNavigationMenuItemMaps,
    });

    const { flatNavigationMenuItemsToCreate: favoriteNavItemsToCreate } =
      await this.migrateFavorites({
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        twentyStandardApplicationUniversalIdentifier:
          twentyStandardFlatApplication.universalIdentifier,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
        workspaceCustomApplicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatObjectMetadataMaps,
        flatViewMaps,
        folderIdMapping,
        existingFlatNavigationMenuItemMaps,
        flatFieldMetadataMaps,
      });

    const allFlatNavigationMenuItemsToCreate = [
      ...folderNavItemsToCreate,
      ...favoriteNavItemsToCreate,
    ];

    if (allFlatNavigationMenuItemsToCreate.length > 0) {
      const { flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatNavigationMenuItemMaps',
        ]);

      const twentyStandardItems = allFlatNavigationMenuItemsToCreate.filter(
        (item) => item.applicationId === twentyStandardFlatApplication.id,
      );
      const workspaceCustomItems = allFlatNavigationMenuItemsToCreate.filter(
        (item) => item.applicationId === workspaceCustomFlatApplication.id,
      );

      if (workspaceCustomItems.length > 0) {
        await this.createNavigationMenuItems({
          workspaceId,
          flatNavigationMenuItemsToCreate: workspaceCustomItems,
          existingFlatNavigationMenuItemMaps,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        });
      }

      if (twentyStandardItems.length > 0) {
        await this.createNavigationMenuItems({
          workspaceId,
          flatNavigationMenuItemsToCreate: twentyStandardItems,
          existingFlatNavigationMenuItemMaps,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        });
      }
    }

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
    workspaceCustomApplicationId,
    workspaceCustomApplicationUniversalIdentifier,
    existingFlatNavigationMenuItemMaps,
  }: {
    workspaceId: string;
    workspaceCustomApplicationId: string;
    workspaceCustomApplicationUniversalIdentifier: string;
    existingFlatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
  }): Promise<{
    folderIdMapping: Map<string, Map<string, string>>;
    flatNavigationMenuItemsToCreate: FlatNavigationMenuItem[];
  }> {
    const existingFlatNavigationMenuItemIds = Object.keys(
      existingFlatNavigationMenuItemMaps.universalIdentifierById,
    );

    const favoriteFolderRepository =
      await this.twentyORMGlobalManager.getRepository<FavoriteFolderWorkspaceEntity>(
        workspaceId,
        'favoriteFolder',
        { shouldBypassPermissionChecks: true },
      );

    const favoriteFolders = await favoriteFolderRepository.find({
      where: {
        deletedAt: IsNull(),
        id: Not(In(existingFlatNavigationMenuItemIds)),
      },
      order: { position: 'ASC' },
      relations: {
        favorites: true,
      },
    });

    if (favoriteFolders.length === 0) {
      return {
        folderIdMapping: new Map(),
        flatNavigationMenuItemsToCreate: [],
      };
    }

    const folderIdMapping = new Map<string, Map<string, string>>(); // favoriteFolderId -> workspaceMemberId or workspace-level -> navigationMenuItemId
    const flatNavigationMenuItemsToCreate: FlatNavigationMenuItem[] = [];

    for (const favoriteFolder of favoriteFolders) {
      const workspaceMemberIdToNavigationMenuItemIdMap = new Map<
        string,
        string
      >();

      const workspaceMemberIdsWithFavoritesInFolder = new Set(
        favoriteFolder.favorites
          .map((favorite) => favorite.forWorkspaceMemberId)
          .filter(isDefined),
      );

      const hasWorkspaceScopedFavoritesInFolder = favoriteFolder.favorites.some(
        (favorite) => !isDefined(favorite.forWorkspaceMemberId),
      );

      const now = new Date().toISOString();

      for (const [index, workspaceMemberId] of Array.from(
        workspaceMemberIdsWithFavoritesInFolder,
      ).entries()) {
        const navigationMenuItemId = index === 0 ? favoriteFolder.id : uuidv4();

        workspaceMemberIdToNavigationMenuItemIdMap.set(
          workspaceMemberId,
          navigationMenuItemId,
        );

        const userWorkspaceId =
          await this.getUserWorkspaceIdFromWorkspaceMemberId(
            workspaceMemberId,
            workspaceId,
          );

        const folderToCreate = {
          id: navigationMenuItemId,
          universalIdentifier: navigationMenuItemId,
          userWorkspaceId,
          targetRecordId: null,
          targetObjectMetadataId: null,
          targetObjectMetadataUniversalIdentifier: null,
          viewId: null,
          viewUniversalIdentifier: null,
          folderId: null,
          folderUniversalIdentifier: null,
          name: favoriteFolder.name,
          position: favoriteFolder.position,
          link: null,
          workspaceId,
          applicationId: workspaceCustomApplicationId,
          applicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          createdAt: now,
          updatedAt: now,
        };

        flatNavigationMenuItemsToCreate.push(folderToCreate);
      }

      if (hasWorkspaceScopedFavoritesInFolder) {
        const workspaceLevelNavigationMenuItemId = uuidv4();

        workspaceMemberIdToNavigationMenuItemIdMap.set(
          WORKSPACE_LEVEL,
          workspaceLevelNavigationMenuItemId,
        );

        const workspaceLevelFolderToCreate = {
          id: workspaceLevelNavigationMenuItemId,
          universalIdentifier: workspaceLevelNavigationMenuItemId,
          userWorkspaceId: null,
          targetRecordId: null,
          targetObjectMetadataId: null,
          targetObjectMetadataUniversalIdentifier: null,
          viewId: null,
          viewUniversalIdentifier: null,
          folderId: null,
          folderUniversalIdentifier: null,
          name: favoriteFolder.name,
          position: favoriteFolder.position,
          link: null,
          workspaceId,
          applicationId: workspaceCustomApplicationId,
          applicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          createdAt: now,
          updatedAt: now,
        };

        flatNavigationMenuItemsToCreate.push(workspaceLevelFolderToCreate);
      }

      folderIdMapping.set(
        favoriteFolder.id,
        workspaceMemberIdToNavigationMenuItemIdMap,
      );
    }

    return {
      folderIdMapping,
      flatNavigationMenuItemsToCreate,
    };
  }

  private async migrateFavorites({
    workspaceId,
    twentyStandardApplicationId,
    twentyStandardApplicationUniversalIdentifier,
    workspaceCustomApplicationId,
    workspaceCustomApplicationUniversalIdentifier,
    flatObjectMetadataMaps,
    flatViewMaps,
    folderIdMapping,
    existingFlatNavigationMenuItemMaps,
    flatFieldMetadataMaps,
  }: {
    workspaceId: string;
    twentyStandardApplicationId: string;
    twentyStandardApplicationUniversalIdentifier: string;
    workspaceCustomApplicationId: string;
    workspaceCustomApplicationUniversalIdentifier: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatViewMaps: FlatEntityMaps<FlatView>;
    folderIdMapping: Map<string, Map<string, string>>;
    existingFlatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Promise<{
    migratedFavoriteIds: string[];
    flatNavigationMenuItemsToCreate: FlatNavigationMenuItem[];
  }> {
    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepository<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
        { shouldBypassPermissionChecks: true },
      );

    const existingFlatNavigationMenuItemIds = Object.keys(
      existingFlatNavigationMenuItemMaps.universalIdentifierById,
    );

    const viewIdsFromExistingNavigationMenuItems = Object.values(
      existingFlatNavigationMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((item): string | null => item.viewId)
      .filter(isDefined);

    const favorites = await favoriteRepository.find({
      where: {
        deletedAt: IsNull(),
        id: Not(In(existingFlatNavigationMenuItemIds)),
        viewId: Or(IsNull(), Not(In(viewIdsFromExistingNavigationMenuItems))),
      },
      order: { position: 'ASC' },
    });

    if (favorites.length === 0) {
      return { migratedFavoriteIds: [], flatNavigationMenuItemsToCreate: [] };
    }

    const favoriteObjectMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: STANDARD_OBJECTS.favorite.universalIdentifier,
    });

    if (!isDefined(favoriteObjectMetadata)) {
      throw new Error('Favorite object metadata not found');
    }

    const favoriteRelationFields =
      findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityIds: favoriteObjectMetadata.fieldIds,
      }).filter(
        (field): field is FlatFieldMetadata<FieldMetadataType.RELATION> =>
          isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION),
      );

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
        const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: flatObjectMetadataMaps,
          flatEntityId: field.relationTargetObjectMetadataId,
        });

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
        ? (folderIdMapping
            .get(favorite.favoriteFolderId)
            ?.get(
              isDefined(favorite.forWorkspaceMemberId)
                ? favorite.forWorkspaceMemberId
                : WORKSPACE_LEVEL,
            ) ?? null)
        : null;

      if (isDefined(favorite.viewId)) {
        const existingItem = Object.values(
          existingFlatNavigationMenuItemMaps.byUniversalIdentifier,
        ).find(
          (item): item is FlatNavigationMenuItem =>
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

        const {
          applicationId,
          applicationUniversalIdentifier,
          universalIdentifier,
        } = this.getApplicationIdAndUniversalIdentifierForViewFavorite({
          viewId: favorite.viewId,
          flatViewMaps,
          twentyStandardApplicationId,
          twentyStandardApplicationUniversalIdentifier,
          workspaceCustomApplicationId,
          workspaceCustomApplicationUniversalIdentifier,
        });

        const now = new Date().toISOString();

        flatNavigationMenuItemsToCreate.push({
          id: favorite.id,
          universalIdentifier,
          userWorkspaceId,
          targetRecordId: null,
          targetObjectMetadataId: null,
          targetObjectMetadataUniversalIdentifier: null,
          viewId: favorite.viewId,
          viewUniversalIdentifier:
            flatViewMaps.universalIdentifierById[favorite.viewId] ?? null,
          folderId,
          folderUniversalIdentifier: folderId,
          name: null,
          position: favorite.position,
          link: null,
          workspaceId,
          applicationId,
          applicationUniversalIdentifier,
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

      const now = new Date().toISOString();

      flatNavigationMenuItemsToCreate.push({
        id: favorite.id,
        universalIdentifier: favorite.id,
        userWorkspaceId,
        targetRecordId,
        targetObjectMetadataId,
        targetObjectMetadataUniversalIdentifier:
          flatObjectMetadataMaps.universalIdentifierById[
            targetObjectMetadataId
          ] ?? null,
        viewId: null,
        viewUniversalIdentifier: null,
        folderId,
        folderUniversalIdentifier: folderId,
        name: null,
        position: favorite.position,
        link: null,
        workspaceId,
        applicationId: workspaceCustomApplicationId,
        applicationUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
        createdAt: now,
        updatedAt: now,
      });

      migratedFavoriteIds.push(favorite.id);
    }

    return {
      migratedFavoriteIds,
      flatNavigationMenuItemsToCreate,
    };
  }

  private getApplicationIdAndUniversalIdentifierForViewFavorite({
    viewId,
    flatViewMaps,
    twentyStandardApplicationId,
    twentyStandardApplicationUniversalIdentifier,
    workspaceCustomApplicationId,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    viewId: string;
    flatViewMaps: FlatEntityMaps<FlatView>;
    twentyStandardApplicationId: string;
    twentyStandardApplicationUniversalIdentifier: string;
    workspaceCustomApplicationId: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  }): {
    applicationId: string;
    applicationUniversalIdentifier: string;
    universalIdentifier: string;
  } {
    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatViewMaps,
      flatEntityId: viewId,
    });

    if (!isDefined(flatView)) {
      throw new Error(`View ${viewId} not found`);
    }

    const matchingStandardItem = Object.values(
      STANDARD_NAVIGATION_MENU_ITEMS,
    ).find(
      (item) =>
        'viewUniversalIdentifier' in item &&
        item.viewUniversalIdentifier === flatView.universalIdentifier,
    );

    return !isDefined(matchingStandardItem)
      ? {
          applicationId: workspaceCustomApplicationId,
          applicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          universalIdentifier: uuidv4(),
        }
      : {
          applicationId: twentyStandardApplicationId,
          applicationUniversalIdentifier:
            twentyStandardApplicationUniversalIdentifier,
          universalIdentifier: matchingStandardItem.universalIdentifier,
        };
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
          authContext,
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

  private async createNavigationMenuItems({
    workspaceId,
    flatNavigationMenuItemsToCreate,
    existingFlatNavigationMenuItemMaps: _existingFlatNavigationMenuItemMaps,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    flatNavigationMenuItemsToCreate: FlatNavigationMenuItem[];
    existingFlatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
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
          applicationUniversalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new Error(
        `Failed to create navigation menu items: ${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
    }
  }
}
