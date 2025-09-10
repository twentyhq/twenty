import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';
import { Equal, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
  ViewFieldExceptionMessageKey,
  generateViewFieldExceptionMessage,
  generateViewFieldUserFriendlyExceptionMessage,
} from 'src/engine/core-modules/view/exceptions/view-field.exception';
import { VIEW_FIELD_ENTITY_RELATION_PROPERTIES } from 'src/engine/core-modules/view/flat-view/constants/view-field-entity-relation-properties.constant';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { fromPartialFlatViewFieldToFlatViewFieldWithDefault } from 'src/engine/core-modules/view/flat-view/utils/from-partial-flat-view-field-to-flat-view-field-with-default.util';
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
  private async getExistingFlatViewFieldMaps(
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

  async createOne(
    viewFieldData: Partial<ViewFieldEntity>,
  ): Promise<ViewFieldEntity> {
    if (!isDefined(viewFieldData.workspaceId)) {
      throw new ViewFieldException(
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.WORKSPACE_ID_REQUIRED,
        ),
        ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
        {
          userFriendlyMessage: generateViewFieldUserFriendlyExceptionMessage(
            ViewFieldExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
        },
      );
    }

    const existingFlatViewFieldMaps = await this.getExistingFlatViewFieldMaps(
      viewFieldData.workspaceId,
    );

    const flatViewFieldFromCreateInput =
      fromPartialFlatViewFieldToFlatViewFieldWithDefault({
        ...viewFieldData,
        universalIdentifier: viewFieldData.universalIdentifier ?? v4(),
      });

    const toFlatViewFieldMaps: FlatViewFieldMaps =
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatViewFieldFromCreateInput,
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
          workspaceId: viewFieldData.workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationOrchestratorException(
        'Multiple validation errors occurred while creating view field',
      );
    }

    const [createdViewField] = await this.viewFieldRepository.find({
      where: {
        id: flatViewFieldFromCreateInput.id,
      },
    });

    return createdViewField;
  }

  async updateOne(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewFieldEntity>,
  ): Promise<ViewFieldEntity> {
    const existingFlatViewFieldMaps =
      await this.getExistingFlatViewFieldMaps(workspaceId);

    const existingViewField = existingFlatViewFieldMaps.byId[id];

    if (!isDefined(existingViewField)) {
      throw new ViewFieldException(
        generateViewFieldExceptionMessage(
          ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
          id,
        ),
        ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
      );
    }

    const existingViewFieldToUpdate = removePropertiesFromRecord(
      {
        ...existingViewField,
        ...updateData,
      },
      VIEW_FIELD_ENTITY_RELATION_PROPERTIES,
    );

    const flatViewFieldFromUpdateInput =
      fromPartialFlatViewFieldToFlatViewFieldWithDefault({
        ...existingViewFieldToUpdate,
        universalIdentifier:
          existingViewFieldToUpdate.universalIdentifier ?? '',
      });

    const toFlatViewFieldMaps: FlatViewFieldMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: flatViewFieldFromUpdateInput,
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

    const [updatedViewField] = await this.viewFieldRepository.find({
      where: {
        id: Equal(id),
      },
    });

    return updatedViewField;
  }

  async deleteOne(id: string, workspaceId: string): Promise<boolean> {
    const existingFlatViewFieldMaps =
      await this.getExistingFlatViewFieldMaps(workspaceId);

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
