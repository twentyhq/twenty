import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/get-sub-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';
import { DeleteViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/delete-view-field.input';
import { DestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/destroy-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/engine/core-modules/view/dtos/view-field.dto';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/core-modules/view/flat-view/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { fromDeleteViewFieldInputToFlatViewFieldOrThrow } from 'src/engine/core-modules/view/flat-view/utils/from-delete-view-field-input-to-flat-view-field-or-throw.util';
import { fromDestroyViewFieldInputToFlatViewFieldOrThrow } from 'src/engine/core-modules/view/flat-view/utils/from-destroy-view-field-input-to-flat-view-field-or-throw.util';
import { fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow } from 'src/engine/core-modules/view/flat-view/utils/from-update-view-field-input-to-flat-view-field-to-update-or-throw.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewFieldV2Service {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async createOne({
    createViewFieldInput,
    workspaceId,
  }: {
    createViewFieldInput: CreateViewFieldInput;
    workspaceId: string;
  }): Promise<ViewFieldDTO> {
    const {
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatViewMaps,
      flatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatEntities: [
          'flatViewFieldMaps',
          'flatViewMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const flatViewFieldToCreate =
      fromCreateViewFieldInputToFlatViewFieldToCreate({
        createViewFieldInput,
        workspaceId,
      });

    const toFlatViewFieldMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatViewFieldToCreate,
      flatEntityMaps: existingFlatViewFieldMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFieldMaps: {
              from: existingFlatViewFieldMaps,
              to: toFlatViewFieldMaps,
            },
          },
          dependencyAllFlatEntityMaps: {
            flatFieldMetadataMaps,
            flatViewMaps,
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating view field',
      );
    }

    const { flatViewFieldMaps: recomputedExistingFlatViewFieldMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatViewFieldMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewFieldToCreate.id,
      flatEntityMaps: recomputedExistingFlatViewFieldMaps,
    });
  }

  async updateOne({
    updateViewFieldInput,
    workspaceId,
  }: {
    workspaceId: string;
    updateViewFieldInput: UpdateViewFieldInput;
  }): Promise<ViewFieldDTO> {
    const { flatViewFieldMaps: existingFlatViewFieldMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatViewFieldMaps'],
        },
      );

    const optimisticallyUpdatedFlatView =
      fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow({
        flatViewFieldMaps: existingFlatViewFieldMaps,
        updateViewFieldInput,
      });

    const fromFlatViewFieldMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [optimisticallyUpdatedFlatView.id],
      flatEntityMaps: existingFlatViewFieldMaps,
    });
    const toFlatViewFieldMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: optimisticallyUpdatedFlatView,
      flatEntityMaps: fromFlatViewFieldMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFieldMaps: {
              from: fromFlatViewFieldMaps,
              to: toFlatViewFieldMaps,
            },
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating view field',
      );
    }

    const { flatViewFieldMaps: recomputedExistingFlatViewFieldMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatViewFieldMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatView.id,
      flatEntityMaps: recomputedExistingFlatViewFieldMaps,
    });
  }

  async deleteOne({
    deleteViewFieldInput,
    workspaceId,
  }: {
    deleteViewFieldInput: DeleteViewFieldInput;
    workspaceId: string;
  }): Promise<ViewFieldDTO> {
    const { flatViewFieldMaps: existingFlatViewFieldMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatViewFieldMaps'],
        },
      );

    const optimisticallyUpdatedFlatViewWithDeletedAt =
      fromDeleteViewFieldInputToFlatViewFieldOrThrow({
        flatViewFieldMaps: existingFlatViewFieldMaps,
        deleteViewFieldInput,
      });

    const toFlatViewFieldMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: optimisticallyUpdatedFlatViewWithDeletedAt,
      flatEntityMaps: existingFlatViewFieldMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFieldMaps: {
              from: existingFlatViewFieldMaps,
              to: toFlatViewFieldMaps,
            },
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: false,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting view field',
      );
    }

    const { flatViewFieldMaps: recomputedExistingFlatViewFieldMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatViewFieldMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatViewWithDeletedAt.id,
      flatEntityMaps: recomputedExistingFlatViewFieldMaps,
    });
  }

  async destroyOne({
    destroyViewFieldInput,
    workspaceId,
  }: {
    destroyViewFieldInput: DestroyViewFieldInput;
    workspaceId: string;
  }): Promise<ViewFieldDTO> {
    const {
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatViewMaps: existingFlatViewMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatViewFieldMaps', 'flatViewMaps'],
        },
      );

    const existingViewFieldToDelete =
      fromDestroyViewFieldInputToFlatViewFieldOrThrow({
        destroyViewFieldInput,
        flatViewFieldMaps: existingFlatViewFieldMaps,
      });

    const fromFlatViewFieldMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [existingViewFieldToDelete.id],
      flatEntityMaps: existingFlatViewFieldMaps,
    });
    const toFlatViewFieldMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      flatEntityMaps: fromFlatViewFieldMaps,
      entityToDeleteId: existingViewFieldToDelete.id,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatViewFieldMaps: {
              from: fromFlatViewFieldMaps,
              to: toFlatViewFieldMaps,
            },
          },
          dependencyAllFlatEntityMaps: {
            flatViewMaps: existingFlatViewMaps,
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: true,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting view field',
      );
    }

    return existingViewFieldToDelete;
  }
}
