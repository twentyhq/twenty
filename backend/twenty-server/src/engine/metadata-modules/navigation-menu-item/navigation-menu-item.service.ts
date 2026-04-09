import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { addFlatNavigationMenuItemToMapsAndUpdateIndex } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/add-flat-navigation-menu-item-to-maps-and-update-index.util';
import { fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-create-navigation-menu-item-input-to-flat-navigation-menu-item-to-create.util';
import { fromDeleteNavigationMenuItemInputToFlatNavigationMenuItemOrThrow } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-delete-navigation-menu-item-input-to-flat-navigation-menu-item-or-throw.util';
import { fromFlatNavigationMenuItemToNavigationMenuItemDto } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-flat-navigation-menu-item-to-navigation-menu-item-dto.util';
import { fromUpdateNavigationMenuItemInputToFlatNavigationMenuItemToUpdateOrThrow } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-update-navigation-menu-item-input-to-flat-navigation-menu-item-to-update-or-throw.util';
import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';
import { type NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';
import { RecordIdentifierDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/record-identifier.dto';
import {
  type UpdateNavigationMenuItemInput,
  type UpdateOneNavigationMenuItemInput,
} from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import {
  NavigationMenuItemException,
  NavigationMenuItemExceptionCode,
} from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { NavigationMenuItemAccessService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-access.service';
import { NavigationMenuItemRecordIdentifierService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-record-identifier.service';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class NavigationMenuItemService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly navigationMenuItemAccessService: NavigationMenuItemAccessService,
    private readonly navigationMenuItemRecordIdentifierService: NavigationMenuItemRecordIdentifierService,
  ) {}

  async findAll({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<NavigationMenuItemDTO[]> {
    const { flatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    return Object.values(flatNavigationMenuItemMaps.byUniversalIdentifier)
      .filter(
        (item): item is NonNullable<typeof item> =>
          isDefined(item) &&
          (!isDefined(item.userWorkspaceId) ||
            item.userWorkspaceId === userWorkspaceId),
      )
      .sort((a, b) => a.position - b.position)
      .map(fromFlatNavigationMenuItemToNavigationMenuItemDto);
  }

  async findById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<NavigationMenuItemDTO | null> {
    const { flatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    const flatNavigationMenuItem = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatNavigationMenuItemMaps,
    });

    if (!isDefined(flatNavigationMenuItem)) {
      return null;
    }

    return fromFlatNavigationMenuItemToNavigationMenuItemDto(
      flatNavigationMenuItem,
    );
  }

  async findByIdOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<NavigationMenuItemDTO> {
    const navigationMenuItem = await this.findById({ id, workspaceId });

    if (!isDefined(navigationMenuItem)) {
      throw new NavigationMenuItemException(
        'Navigation menu item not found',
        NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND,
      );
    }

    return navigationMenuItem;
  }

  async create({
    input,
    workspaceId,
    authUserWorkspaceId,
    authApiKeyId,
    authApplicationId,
  }: {
    input: CreateNavigationMenuItemInput;
    workspaceId: string;
    authUserWorkspaceId?: string;
    authApiKeyId?: string;
    authApplicationId?: string;
  }): Promise<NavigationMenuItemDTO> {
    const createdItems = await this.createMany({
      inputs: [input],
      workspaceId,
      authUserWorkspaceId,
      authApiKeyId,
      authApplicationId,
    });

    const created = createdItems[0];

    if (!isDefined(created)) {
      throw new NavigationMenuItemException(
        'Failed to create navigation menu item',
        NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      );
    }

    return created;
  }

  async createMany({
    inputs,
    workspaceId,
    authUserWorkspaceId,
    authApiKeyId,
    authApplicationId,
  }: {
    inputs: CreateNavigationMenuItemInput[];
    workspaceId: string;
    authUserWorkspaceId?: string;
    authApiKeyId?: string;
    authApplicationId?: string;
  }): Promise<NavigationMenuItemDTO[]> {
    if (inputs.length === 0) {
      return [];
    }

    for (const input of inputs) {
      await this.navigationMenuItemAccessService.canUserCreateNavigationMenuItem(
        {
          userWorkspaceId: authUserWorkspaceId,
          workspaceId,
          apiKeyId: authApiKeyId,
          applicationId: authApplicationId,
          inputUserWorkspaceId: input.userWorkspaceId,
        },
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps,
      flatObjectMetadataMaps,
      flatViewMaps,
    } = await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatNavigationMenuItemMaps',
          'flatObjectMetadataMaps',
          'flatViewMaps',
        ],
      },
    );

    const optimisticFlatNavigationMenuItemMaps = structuredClone(
      existingFlatNavigationMenuItemMaps,
    );

    const foldersFirst = [...inputs].sort((a, b) => {
      const aIsFolder = a.type === NavigationMenuItemType.FOLDER ? 0 : 1;
      const bIsFolder = b.type === NavigationMenuItemType.FOLDER ? 0 : 1;

      return aIsFolder - bIsFolder;
    });

    const flatEntityByInput = new Map<
      CreateNavigationMenuItemInput,
      FlatNavigationMenuItem
    >();

    const flatNavigationMenuItemsToCreate = foldersFirst.map((input) => {
      const normalizedInput: CreateNavigationMenuItemInput = {
        ...input,
        userWorkspaceId:
          isDefined(input.userWorkspaceId) && isDefined(authUserWorkspaceId)
            ? authUserWorkspaceId
            : input.userWorkspaceId,
      };

      const flatNavigationMenuItemToCreate =
        fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate({
          createNavigationMenuItemInput: normalizedInput,
          workspaceId,
          flatApplication: workspaceCustomFlatApplication,
          flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
          flatObjectMetadataMaps,
          flatViewMaps,
        });

      addFlatNavigationMenuItemToMapsAndUpdateIndex({
        flatNavigationMenuItem: flatNavigationMenuItemToCreate,
        flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
      });

      flatEntityByInput.set(input, flatNavigationMenuItemToCreate);

      return flatNavigationMenuItemToCreate;
    });

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
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating navigation menu items',
      );
    }

    const { flatNavigationMenuItemMaps: recomputedFlatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    return inputs.map((input) =>
      fromFlatNavigationMenuItemToNavigationMenuItemDto(
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: flatEntityByInput.get(input)!.id,
          flatEntityMaps: recomputedFlatNavigationMenuItemMaps,
        }),
      ),
    );
  }

  async update({
    input,
    workspaceId,
    authUserWorkspaceId,
    authApiKeyId,
    authApplicationId,
  }: {
    input: UpdateNavigationMenuItemInput & { id: string };
    workspaceId: string;
    authUserWorkspaceId?: string;
    authApiKeyId?: string;
    authApplicationId?: string;
  }): Promise<NavigationMenuItemDTO> {
    const { id, ...update } = input;

    const updatedItems = await this.updateMany({
      inputs: [{ id, update }],
      workspaceId,
      authUserWorkspaceId,
      authApiKeyId,
      authApplicationId,
    });

    const updated = updatedItems[0];

    if (!isDefined(updated)) {
      throw new NavigationMenuItemException(
        'Failed to update navigation menu item',
        NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      );
    }

    return updated;
  }

  async updateMany({
    inputs,
    workspaceId,
    authUserWorkspaceId,
    authApiKeyId,
    authApplicationId,
  }: {
    inputs: UpdateOneNavigationMenuItemInput[];
    workspaceId: string;
    authUserWorkspaceId?: string;
    authApiKeyId?: string;
    authApplicationId?: string;
  }): Promise<NavigationMenuItemDTO[]> {
    if (inputs.length === 0) {
      return [];
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    const flatNavigationMenuItemsToUpdate: FlatNavigationMenuItem[] = [];

    for (const { id, update } of inputs) {
      const updateInput: UpdateNavigationMenuItemInput & { id: string } = {
        ...update,
        id,
      };

      const existingNavigationMenuItem = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: id,
        flatEntityMaps: existingFlatNavigationMenuItemMaps,
      });

      if (isDefined(existingNavigationMenuItem)) {
        await this.navigationMenuItemAccessService.canUserUpdateNavigationMenuItem(
          {
            userWorkspaceId: authUserWorkspaceId,
            workspaceId,
            apiKeyId: authApiKeyId,
            applicationId: authApplicationId,
            existingUserWorkspaceId: existingNavigationMenuItem.userWorkspaceId,
          },
        );
      }

      flatNavigationMenuItemsToUpdate.push(
        fromUpdateNavigationMenuItemInputToFlatNavigationMenuItemToUpdateOrThrow(
          {
            flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps,
            updateNavigationMenuItemInput: updateInput,
          },
        ),
      );
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatNavigationMenuItemsToUpdate,
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating navigation menu items',
      );
    }

    const { flatNavigationMenuItemMaps: recomputedFlatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    return inputs.map(({ id }) =>
      fromFlatNavigationMenuItemToNavigationMenuItemDto(
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: id,
          flatEntityMaps: recomputedFlatNavigationMenuItemMaps,
        }),
      ),
    );
  }

  async delete({
    id,
    workspaceId,
    authUserWorkspaceId,
    authApiKeyId,
    authApplicationId,
  }: {
    id: string;
    workspaceId: string;
    authUserWorkspaceId?: string;
    authApiKeyId?: string;
    authApplicationId?: string;
  }): Promise<NavigationMenuItemDTO> {
    const deletedItems = await this.deleteMany({
      ids: [id],
      workspaceId,
      authUserWorkspaceId,
      authApiKeyId,
      authApplicationId,
    });

    const deleted = deletedItems[0];

    if (!isDefined(deleted)) {
      throw new NavigationMenuItemException(
        'Failed to delete navigation menu item',
        NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND,
      );
    }

    return deleted;
  }

  async deleteMany({
    ids,
    workspaceId,
    authUserWorkspaceId,
    authApiKeyId,
    authApplicationId,
  }: {
    ids: string[];
    workspaceId: string;
    authUserWorkspaceId?: string;
    authApiKeyId?: string;
    authApplicationId?: string;
  }): Promise<NavigationMenuItemDTO[]> {
    if (ids.length === 0) {
      return [];
    }

    const uniqueOrderedIds: string[] = [];
    const seenId = new Set<string>();

    for (const id of ids) {
      if (!seenId.has(id)) {
        seenId.add(id);
        uniqueOrderedIds.push(id);
      }
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    const flatEntitiesToDeleteOrdered: FlatNavigationMenuItem[] = [];
    const seenDeleteId = new Set<string>();
    const deletedNavigationMenuItemDtoByRequestedId = new Map<
      string,
      NavigationMenuItemDTO
    >();

    for (const requestedId of uniqueOrderedIds) {
      const flatNavigationMenuItemRoot =
        fromDeleteNavigationMenuItemInputToFlatNavigationMenuItemOrThrow({
          flatNavigationMenuItemMaps: existingFlatNavigationMenuItemMaps,
          navigationMenuItemId: requestedId,
        });

      await this.navigationMenuItemAccessService.canUserDeleteNavigationMenuItem(
        {
          userWorkspaceId: authUserWorkspaceId,
          workspaceId,
          apiKeyId: authApiKeyId,
          applicationId: authApplicationId,
          existingUserWorkspaceId: flatNavigationMenuItemRoot.userWorkspaceId,
        },
      );

      deletedNavigationMenuItemDtoByRequestedId.set(
        requestedId,
        fromFlatNavigationMenuItemToNavigationMenuItemDto(
          flatNavigationMenuItemRoot,
        ),
      );

      const flatEntitiesForRoot = [flatNavigationMenuItemRoot];

      if (flatNavigationMenuItemRoot.type === NavigationMenuItemType.FOLDER) {
        const userWorkspaceIdKey =
          flatNavigationMenuItemRoot.userWorkspaceId ?? 'null';
        const folderChildren =
          existingFlatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[
            userWorkspaceIdKey
          ]?.[requestedId] ?? [];
        flatEntitiesForRoot.unshift(...folderChildren);
      }

      for (const flatEntity of flatEntitiesForRoot) {
        if (!seenDeleteId.has(flatEntity.id)) {
          seenDeleteId.add(flatEntity.id);
          flatEntitiesToDeleteOrdered.push(flatEntity);
        }
      }
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatEntitiesToDeleteOrdered,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting navigation menu items',
      );
    }

    return uniqueOrderedIds.map((requestedId) => {
      const dto = deletedNavigationMenuItemDtoByRequestedId.get(requestedId);

      if (!isDefined(dto)) {
        throw new NavigationMenuItemException(
          'Failed to resolve deleted navigation menu item in batch',
          NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND,
        );
      }

      return dto;
    });
  }

  async findTargetRecord({
    targetRecordId,
    targetObjectMetadataId,
    workspaceId,
    authContext,
  }: {
    targetRecordId: string;
    targetObjectMetadataId: string;
    workspaceId: string;
    authContext: WorkspaceAuthContext;
  }): Promise<RecordIdentifierDTO | null> {
    try {
      return await this.navigationMenuItemRecordIdentifierService.resolveRecordIdentifier(
        {
          targetRecordId,
          targetObjectMetadataId,
          workspaceId,
          authContext,
        },
      );
    } catch (error: unknown) {
      if (error instanceof PermissionsException) {
        return null;
      }
      throw error;
    }
  }
}
