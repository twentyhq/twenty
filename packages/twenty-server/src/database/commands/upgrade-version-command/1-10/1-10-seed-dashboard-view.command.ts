import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

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
    // const [dashboardObjectMetadata] = await this.objectMetadataRepository.find({
    //   where: {
    //     workspaceId,
    //     standardId: STANDARD_OBJECT_IDS.dashboard,
    //   },
    //   relations: ['fields'],
    // });

    // if (!isDefined(dashboardObjectMetadata)) {
    //   throw new Error(
    //     `Dashboard object metadata not found for workspace ${workspaceId}`,
    //   );
    // }

    // const views = [
    //   dashboardsAllView({
    //     objectMetadataItems: [dashboardObjectMetadata],
    //     useCoreNaming: true,
    //     applications: {},
    //   }),
    // ];

    // const schema = await this.dataSourceRepository.findOne({
    //   where: {
    //     workspaceId,
    //   },
    // });

    // if (!isDefined(schema)) {
    //   throw new Error(`Schema not found for workspace ${workspaceId}`);
    // }

    // const existingViews = await this.viewRepository.find({
    //   where: {
    //     workspaceId,
    //     objectMetadataId: dashboardObjectMetadata.id,
    //     key: ViewKey.INDEX,
    //   },
    // });

    // if (existingViews.length > 0) {
    //   this.logger.log(
    //     `Dashboard view already exists for workspace ${workspaceId}. Skipping...`,
    //   );

    //   return;
    // }

    // if (options.dryRun) {
    //   this.logger.log(
    //     `Would have seeded dashboard view for workspace ${workspaceId}. Skipping...`,
    //   );

    //   return;
    // }

    // const queryRunner = this.coreDataSource.createQueryRunner();

    // await queryRunner.connect();

    // const createdViews = await createCoreViews(
    //   queryRunner,
    //   workspaceId,
    //   views,
    //   {},
    // );

    // await prefillWorkspaceFavorites(
    //   createdViews.map((view) => view.id),
    //   queryRunner.manager as WorkspaceEntityManager,
    //   schema.schema,
    // );

    // await queryRunner.release();
    // this.logger.log(
    //   `Successfully seeded dashboard view for workspace ${workspaceId}: ${createdViews.map((view) => view.name).join(', ')}`,
    // );
  }
}
