import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { createCoreViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-core-views';
import { prefillWorkspaceFavorites } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workspace-favorites';
import { dashboardsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/dashboards-all.view';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@Command({
  name: 'upgrade:1-10:seed-dashboard-view',
  description: 'Seed the dashboard view',
})
export class SeedDashboardViewCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(DataSourceEntity)
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const [dashboardObjectMetadata] = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
        standardId: STANDARD_OBJECT_IDS.dashboard,
      },
      relations: ['fields'],
    });

    if (!isDefined(dashboardObjectMetadata)) {
      throw new Error(
        `Dashboard object metadata not found for workspace ${workspaceId}`,
      );
    }

    const views = [dashboardsAllView([dashboardObjectMetadata], true)];

    const schema = await this.dataSourceRepository.findOne({
      where: {
        workspaceId,
      },
    });

    if (!isDefined(schema)) {
      throw new Error(`Schema not found for workspace ${workspaceId}`);
    }

    const existingViews = await this.viewRepository.find({
      where: {
        workspaceId,
        objectMetadataId: dashboardObjectMetadata.id,
        key: ViewKey.INDEX,
      },
    });

    if (existingViews.length > 0) {
      this.logger.log(
        `Dashboard view already exists for workspace ${workspaceId}. Skipping...`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would have seeded dashboard view for workspace ${workspaceId}. Skipping...`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    const createdViews = await createCoreViews(queryRunner, workspaceId, views);

    await prefillWorkspaceFavorites(
      createdViews.map((view) => view.id),
      queryRunner.manager as WorkspaceEntityManager,
      schema.schema,
    );

    await queryRunner.release();
    this.logger.log(
      `Successfully seeded dashboard view for workspace ${workspaceId}: ${createdViews.map((view) => view.name).join(', ')}`,
    );
  }
}
