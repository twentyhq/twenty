import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:1-21:backfill-datasource-to-workspace',
  description:
    'Backfill workspace.databaseSchema from the dataSource entity for workspaces that have not been migrated yet',
})
export class BackfillDatasourceToWorkspaceCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(DataSourceEntity)
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      this.logger.warn(`Workspace ${workspaceId} not found, skipping`);

      return;
    }

    if (workspace.databaseSchema) {
      this.logger.log(
        `Workspace ${workspaceId} already has databaseSchema="${workspace.databaseSchema}", skipping`,
      );

      return;
    }

    const dataSource = await this.dataSourceRepository.findOne({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });

    if (!dataSource) {
      this.logger.warn(
        `No dataSource found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (!dataSource.schema) {
      this.logger.warn(
        `DataSource for workspace ${workspaceId} has no schema set, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would set workspace ${workspaceId} databaseSchema to "${dataSource.schema}"`,
      );

      return;
    }

    await this.workspaceRepository.update(workspaceId, {
      databaseSchema: dataSource.schema,
    });

    this.logger.log(
      `Backfilled workspace ${workspaceId} databaseSchema to "${dataSource.schema}"`,
    );
  }
}
