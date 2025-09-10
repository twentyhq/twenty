import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { t } from '@lingui/core/macro';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/core-modules/common/exceptions/flat-entity-maps.exception';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';
import { DeleteDestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/delete-destroy-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/engine/core-modules/view/dtos/view-field.dto';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/core-modules/view/flat-view/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { fromDeleteOrDestroyViewFieldInputToFlatViewFieldOrThrow } from 'src/engine/core-modules/view/flat-view/utils/from-delete-or-destroy-view-field-input-to-flat-view-field-or-throw.util';
import { fromUpdateViewFieldInputToFlatViewFieldToOrThrow } from 'src/engine/core-modules/view/flat-view/utils/from-update-view-field-input-to-flat-view-field-to-update-or-throw.util';
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

    const createdFlatViewField =
      recomputedExistingFlatViewFieldMaps.byId[flatViewFieldToCreate.id];
    if (!isDefined(createdFlatViewField)) {
      throw new FlatEntityMapsException(
        t`Created view field not found in cache`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    return createdFlatViewField;
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

    const optimistcallyUpdatedFlatView =
      fromUpdateViewFieldInputToFlatViewFieldToOrThrow({
        flatViewFieldMaps: existingFlatViewFieldMaps,
        updateViewFieldInput,
      });

    const toFlatViewFieldMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: optimistcallyUpdatedFlatView,
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

    const updatedFlatViewField =
      recomputedExistingFlatViewFieldMaps.byId[optimistcallyUpdatedFlatView.id];
    if (!isDefined(updatedFlatViewField)) {
      throw new FlatEntityMapsException(
        t`Created view field not found in cache`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    return updatedFlatViewField;
  }

  async deleteOne({
    deleteViewFieldInput,
    workspaceId,
  }: {
    deleteViewFieldInput: DeleteDestroyViewFieldInput;
    workspaceId: string;
  }): Promise<ViewFieldDTO> {
    const existingFlatViewFieldMaps =
      await this.getExistingFlatViewFieldMapsFromCache(workspaceId);

    const existingViewFieldToDelete =
      fromDeleteOrDestroyViewFieldInputToFlatViewFieldOrThrow({
        deleteDestroyViewInput: deleteViewFieldInput,
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
