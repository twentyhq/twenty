import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { id } from 'date-fns/locale';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';
import { DeleteDestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/delete-destroy-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/engine/core-modules/view/dtos/view-field.dto';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
  ViewFieldExceptionMessageKey,
  generateViewFieldExceptionMessage,
} from 'src/engine/core-modules/view/exceptions/view-field.exception';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/core-modules/view/flat-view/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { fromUpdateViewFieldInputToFlatViewFieldToOrThrow } from 'src/engine/core-modules/view/flat-view/utils/from-update-view-field-input-to-flat-view-field-to-update.util';
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
      throw new Error('Whatver'); //TODO
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
        flatViewMaps: existingFlatViewFieldMaps,
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

    const createdFlatViewField =
      recomputedExistingFlatViewFieldMaps.byId[optimistcallyUpdatedFlatView.id];
    if (!isDefined(createdFlatViewField)) {
      throw new Error('Whatver'); //TODO
    }

    return createdFlatViewField;
  }

  async deleteOne({
    deleteViewFieldInput,
    workspaceId,
  }: {
    deleteViewFieldInput: DeleteDestroyViewFieldInput;
    workspaceId: string;
  }): Promise<boolean> {
    const existingFlatViewFieldMaps =
      await this.getExistingFlatViewFieldMapsFromCache(workspaceId);

    const existingViewFieldToDelete = existingFlatViewFieldMaps.byId[id];

    if (!isDefined(existingViewFieldToDelete)) {
      throw new ViewFieldException(
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          id,
        ),
        ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
      );
    }

    const toFlatViewFieldMaps: FlatViewFieldMaps =
      deleteFlatEntityFromFlatEntityMapsOrThrow({
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

    return true;
  }
}
