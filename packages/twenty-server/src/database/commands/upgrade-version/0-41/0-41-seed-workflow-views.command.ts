import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { EntityManager, IsNull, Not, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { createWorkspaceViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/create-workspace-views';
import { workflowRunsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflow-runs-all.view';
import { workflowVersionsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflow-versions-all.view';
import { workflowsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflows-all.view';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@Command({
  name: 'upgrade-0.41:workflow-seed-views',
  description: 'Seed workflow views for workspace.',
})
export class SeedWorkflowViewsCommand extends ActiveWorkspacesCommandRunner {
  protected readonly logger: Logger;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {
    super(workspaceRepository);
    this.logger = new Logger(this.constructor.name);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: ActiveWorkspacesCommandOptions,
    _workspaceIds: string[],
  ): Promise<void> {
    const { dryRun } = _options;

    for (const workspaceId of _workspaceIds) {
      await this.execute(workspaceId, dryRun);
    }
  }

  private async execute(workspaceId: string, dryRun = false): Promise<void> {
    this.logger.log(`Seeding workflow views for workspace: ${workspaceId}`);

    const workflowObjectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          standardId: STANDARD_OBJECT_IDS.workflow,
        },
      });

    if (!workflowObjectMetadata) {
      this.logger.error('Workflow object metadata not found');

      return;
    }

    await this.seedWorkflowViews(
      workspaceId,
      workflowObjectMetadata.id,
      dryRun,
    );

    await this.seedWorkspaceFavorite(
      workspaceId,
      workflowObjectMetadata.id,
      dryRun,
    );

    await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
      workspaceId,
    );
  }

  private async seedWorkflowViews(
    workspaceId: string,
    workflowObjectMetadataId: string,
    dryRun = false,
  ) {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'view',
      );

    const existingWorkflowView = await viewRepository.findOne({
      where: {
        objectMetadataId: workflowObjectMetadataId,
      },
    });

    if (existingWorkflowView) {
      this.logger.log(`View already exists: ${existingWorkflowView.id}`);

      return;
    }

    if (dryRun) {
      this.logger.log(`Dry run: not creating view`);

      return;
    }

    const { objectMetadataStandardIdToIdMap } =
      await this.objectMetadataService.getObjectMetadataStandardIdToIdMap(
        workspaceId,
      );

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    if (!workspaceDataSource) {
      this.logger.error('Could not connect to workspace data source');

      return;
    }

    const viewDefinitions = [
      workflowsAllView(objectMetadataStandardIdToIdMap),
      workflowVersionsAllView(objectMetadataStandardIdToIdMap),
      workflowRunsAllView(objectMetadataStandardIdToIdMap),
    ];

    await workspaceDataSource.transaction(
      async (entityManager: EntityManager) => {
        return createWorkspaceViews(
          entityManager,
          dataSourceMetadata.schema,
          viewDefinitions,
        );
      },
    );
  }

  private async seedWorkspaceFavorite(
    workspaceId: string,
    workflowObjectMetadataId: string,
    dryRun = false,
  ) {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'view',
      );

    const workflowView = await viewRepository.findOne({
      where: {
        objectMetadataId: workflowObjectMetadataId,
      },
    });

    if (!workflowView) {
      this.logger.error('Workflow view not found');

      return;
    }

    if (dryRun) {
      this.logger.log(`Dry run: not creating favorite`);

      return;
    }

    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'favorite',
      );

    const existingFavorites = await favoriteRepository.find({
      where: {
        viewId: Not(IsNull()),
      },
    });

    const workflowFavorite = existingFavorites.find(
      (favorite) => favorite.viewId === workflowView.id,
    );

    if (workflowFavorite) {
      this.logger.log(`Favorite already exists: ${workflowFavorite.id}`);

      return;
    }

    await favoriteRepository.insert({
      viewId: workflowView.id,
      position: existingFavorites.length,
    });
  }
}
