import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: '1-10-create-view-kanban-field-metadata-id-foreign-key-migration',
  description:
    'Create FK_b3cc95732479f7a1337350c398f foreign key on view kanban field metadata id column',
})
export class WorkspaceCustomApplicationIdNonNullableCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
      this.logger.log(
        'Skipping has already been run once WorkspaceCustomApplicationIdNonNullableCommand',
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    if (!options.dryRun) {
      try {
        await queryRunner.query(
          `ALTER TABLE "core"."workspace" DROP CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755"`,
        );
        await queryRunner.query(
          `ALTER TABLE "core"."workspace" ALTER COLUMN "workspaceCustomApplicationId" SET NOT NULL`,
        );
        await queryRunner.query(
          `ALTER TABLE "core"."workspace" ADD CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755" FOREIGN KEY ("workspaceCustomApplicationId") REFERENCES "core"."application"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
        );

        await queryRunner.commitTransaction();
        this.logger.log(
          'Successfully run WorkspaceCustomApplicationIdNonNullableCommand',
        );
        this.hasRunOnce = true;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.log(
          `Rollbacking WorkspaceCustomApplicationIdNonNullableCommand: ${error.message}`,
        );
      } finally {
        await queryRunner.release();
      }
    }
  }
}
