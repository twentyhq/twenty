import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { runNonNullableUniversalIdentifierAndApplicationIdOnSyncableEntitiesMigration } from 'src/database/typeorm/core/migrations/utils/run-non-nullable-universal-identifier-and-application-id-on-syncable-entities-migration.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: '1-12-make-syncable-entities-universal-identifier-and-application-id-non-nullable-migration',
  description:
    'Make syncable entities universalIdentifier and applicationId non nullable migration to run once',
})
export class MakeSyncableEntitiesUniversalIdentifierAndApplicationIdNonNullableMigration extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private hasRunOnce = false;

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (this.hasRunOnce) {
      this.logger.log('Skipping has already run once');

      return;
    }

    if (options.dryRun) {
      this.hasRunOnce = true;

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await runNonNullableUniversalIdentifierAndApplicationIdOnSyncableEntitiesMigration(
        {
          queryRunner,
        },
      );

      await queryRunner.commitTransaction();

      this.logger.log(
        'Successfully run make-syncable-entities-universal-identifier-and-application-id-non-nullable-migration once',
      );

      this.hasRunOnce = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
