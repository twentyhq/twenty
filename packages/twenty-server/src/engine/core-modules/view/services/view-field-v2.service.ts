import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';
import { DeleteViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/delete-view-field.input';
import { DestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/destroy-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/engine/core-modules/view/dtos/view-field.dto';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/core-modules/view/flat-view/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { fromDeleteViewFieldInputToFlatViewFieldOrThrow } from 'src/engine/core-modules/view/flat-view/utils/from-delete-view-field-input-to-flat-view-field-or-throw.util';
import { fromDestroyViewFieldInputToFlatViewFieldOrThrow } from 'src/engine/core-modules/view/flat-view/utils/from-destroy-view-field-input-to-flat-view-field-or-throw.util';
import { fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow } from 'src/engine/core-modules/view/flat-view/utils/from-update-view-field-input-to-flat-view-field-to-update-or-throw.util';
import { fromViewFieldEntityToFlatViewField } from 'src/engine/core-modules/view/flat-view/utils/from-view-field-entity-to-flat-view-field.util';
import { WorkspaceMigrationOrchestratorException } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-orchestrator-exception';
import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-build-orchestrator.service';

@Injectable()
export class ViewFieldV2Service {
  constructor(
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
    private readonly workspaceMigrationOrchestratorService: WorkspaceMigrationBuildOrchestratorService,
  ) {}

  // TODO: move to cache service
  private async getExistingFlatViewFieldMapsFromCache(
    workspaceId: string,
  ): Promise<FlatViewFieldMaps> {
    const existingViewFields = await this.viewFieldRepository.find({
      where: { workspaceId },
    });

    const flatViewFieldMaps: FlatViewFieldMaps = {
      byId: {},
      idByUniversalIdentifier: {},
    };

    for (const viewFieldEntity of existingViewFields) {
      const flatViewField = fromViewFieldEntityToFlatViewField(viewFieldEntity);

      flatViewFieldMaps.byId[flatViewField.id] = flatViewField;
      flatViewFieldMaps.idByUniversalIdentifier[
        flatViewField.universalIdentifier
      ] = flatViewField.id;
    }

    return flatViewFieldMaps;
  }

  async createOne({
    createViewFieldInput,
    workspaceId,
  }: {
    createViewFieldInput: CreateViewFieldInput;
    workspaceId: string;
  }): Promise<ViewFieldDTO> {
    const existingFlatViewFieldMaps =
      await this.getExistingFlatViewFieldMapsFromCache(workspaceId);

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
      await this.workspaceMigrationOrchestratorService.buildWorkspaceMigrations(
        {
          entityMaps: {
            viewField: {
              fromFlatViewFieldMaps: existingFlatViewFieldMaps,
              toFlatViewFieldMaps,
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
      throw new WorkspaceMigrationOrchestratorException(
        'Multiple validation errors occurred while creating view field',
      );
    }

    const recomputedExistingFlatViewFieldMaps =
      await this.getExistingFlatViewFieldMapsFromCache(workspaceId);

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
    const existingFlatViewFieldMaps =
      await this.getExistingFlatViewFieldMapsFromCache(workspaceId);

    const optimisticallyUpdatedFlatView =
      fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow({
        flatViewFieldMaps: existingFlatViewFieldMaps,
        updateViewFieldInput,
      });

    const toFlatViewFieldMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: optimisticallyUpdatedFlatView,
      flatEntityMaps: existingFlatViewFieldMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationOrchestratorService.buildWorkspaceMigrations(
        {
          entityMaps: {
            viewField: {
              fromFlatViewFieldMaps: existingFlatViewFieldMaps,
              toFlatViewFieldMaps,
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
      throw new WorkspaceMigrationOrchestratorException(
        'Multiple validation errors occurred while updating view field',
      );
    }

    const recomputedExistingFlatViewFieldMaps =
      await this.getExistingFlatViewFieldMapsFromCache(workspaceId);

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
    const existingFlatViewFieldMaps =
      await this.getExistingFlatViewFieldMapsFromCache(workspaceId);

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
      await this.workspaceMigrationOrchestratorService.buildWorkspaceMigrations(
        {
          entityMaps: {
            viewField: {
              fromFlatViewFieldMaps: existingFlatViewFieldMaps,
              toFlatViewFieldMaps,
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
      throw new WorkspaceMigrationOrchestratorException(
        'Multiple validation errors occurred while updating view field',
      );
    }

    const recomputedExistingFlatViewFieldMaps =
      await this.getExistingFlatViewFieldMapsFromCache(workspaceId);

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
    const existingFlatViewFieldMaps =
      await this.getExistingFlatViewFieldMapsFromCache(workspaceId);

    const existingViewFieldToDelete =
      fromDestroyViewFieldInputToFlatViewFieldOrThrow({
        destroyViewFieldInput,
        flatViewFieldMaps: existingFlatViewFieldMaps,
      });

    const toFlatViewFieldMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      flatEntityMaps: existingFlatViewFieldMaps,
      entityToDeleteId: existingViewFieldToDelete.id,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationOrchestratorService.buildWorkspaceMigrations(
        {
          entityMaps: {
            viewField: {
              fromFlatViewFieldMaps: existingFlatViewFieldMaps,
              toFlatViewFieldMaps,
            },
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: true,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationOrchestratorException(
        'Multiple validation errors occurred while deleting view field',
      );
    }

    return existingViewFieldToDelete;
  }
}
