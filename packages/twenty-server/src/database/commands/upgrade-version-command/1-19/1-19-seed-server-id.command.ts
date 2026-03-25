import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { seedServerId } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-server-id.util';

@Command({
  name: 'upgrade:1-19:seed-server-id',
  description:
    'Seed a unique SERVER_ID (UUID v4) into the keyValuePair table as a CONFIG_VARIABLE',
})
export class SeedServerIdCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private hasRun = false;

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace(): Promise<void> {
    if (this.hasRun) {
      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await seedServerId({ queryRunner, schemaName: 'core' });

    this.hasRun = true;

    await queryRunner.release();

    this.logger.log(`SERVER_ID seeded successfully`);
  }
}
