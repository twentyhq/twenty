import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';
import { Equal, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { ViewCacheService } from 'src/engine/core-modules/view/cache/services/view-cache.service';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import {
  ViewException,
  ViewExceptionCode,
  ViewExceptionMessageKey,
  generateViewExceptionMessage,
  generateViewUserFriendlyExceptionMessage,
} from 'src/engine/core-modules/view/exceptions/view.exception';
import { VIEW_ENTITY_RELATION_PROPERTIES } from 'src/engine/core-modules/view/flat-view/constants/view-entity-relation-properties.constant';
import { FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { fromPartialFlatViewToFlatViewWithDefault } from 'src/engine/core-modules/view/flat-view/utils/from-partial-flat-view-to-flat-view-to-with-default.util';
import { WorkspaceMigrationOrchestratorException } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-orchestrator-exception';
import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-build-orchestrator.service';

@Injectable()
export class ViewV2Service {
  constructor(
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    private readonly workspaceMigrationOrchestratorService: WorkspaceMigrationBuildOrchestratorService,
    private readonly viewCacheService: ViewCacheService,
  ) {}

  async createOne(viewData: Partial<ViewEntity>): Promise<ViewEntity> {
    if (!isDefined(viewData.workspaceId)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED,
        ),
        ViewExceptionCode.INVALID_VIEW_DATA,
        {
          userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
            ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
        },
      );
    }

    const { flatViewMaps: existingFlatViewMaps } =
      await this.viewCacheService.getExistingOrRecomputeFlatViewMaps({
        workspaceId: viewData.workspaceId,
      });

    const flatViewFromCreateInput = fromPartialFlatViewToFlatViewWithDefault({
      ...viewData,
      universalIdentifier: viewData.universalIdentifier ?? v4(),
    });

    const toFlatViewMaps: FlatViewMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatViewFromCreateInput,
      flatEntityMaps: existingFlatViewMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationOrchestratorService.buildWorkspaceMigrations(
        {
          entityMaps: {
            view: {
              fromFlatViewMaps: existingFlatViewMaps,
              toFlatViewMaps,
            },
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: false,
          },
          workspaceId: viewData.workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationOrchestratorException(
        'Multiple validation errors occurred while creating view',
      );
    }

    const [createdView] = await this.viewRepository.find({
      where: {
        id: flatViewFromCreateInput.id,
      },
    });

    return createdView;
  }

  async updateOne(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewEntity>,
  ): Promise<ViewEntity> {
    const { flatViewMaps: existingFlatViewMaps } =
      await this.viewCacheService.getExistingOrRecomputeFlatViewMaps({
        workspaceId,
      });

    const existingView = existingFlatViewMaps.byId[id];

    if (!isDefined(existingView)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    const existingViewToUpdate = removePropertiesFromRecord(
      {
        ...existingView,
        ...updateData,
      },
      VIEW_ENTITY_RELATION_PROPERTIES,
    );

    const flatViewFromUpdateInput = fromPartialFlatViewToFlatViewWithDefault({
      ...existingViewToUpdate,
      universalIdentifier: existingViewToUpdate.universalIdentifier ?? '',
    });

    const toFlatViewMaps: FlatViewMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: flatViewFromUpdateInput,
        flatEntityMaps: existingFlatViewMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationOrchestratorService.buildWorkspaceMigrations(
        {
          entityMaps: {
            view: {
              fromFlatViewMaps: existingFlatViewMaps,
              toFlatViewMaps,
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
        'Multiple validation errors occurred while updating view',
      );
    }

    const [updatedView] = await this.viewRepository.find({
      where: {
        id: Equal(id),
      },
    });

    return updatedView;
  }

  async deleteOne(id: string, workspaceId: string): Promise<boolean> {
    const { flatViewMaps: existingFlatViewMaps } =
      await this.viewCacheService.getExistingOrRecomputeFlatViewMaps({
        workspaceId,
      });

    const existingViewToDelete = existingFlatViewMaps.byId[id];

    if (!isDefined(existingViewToDelete)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    const toFlatViewMaps: FlatViewMaps =
      deleteFlatEntityFromFlatEntityMapsOrThrow({
        flatEntityMaps: existingFlatViewMaps,
        entityToDeleteId: existingViewToDelete.id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationOrchestratorService.buildWorkspaceMigrations(
        {
          entityMaps: {
            view: {
              fromFlatViewMaps: existingFlatViewMaps,
              toFlatViewMaps,
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
        'Multiple validation errors occurred while deleting view',
      );
    }

    return true;
  }
}
