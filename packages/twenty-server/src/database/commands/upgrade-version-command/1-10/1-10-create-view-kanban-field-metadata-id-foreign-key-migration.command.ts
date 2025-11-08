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
export class CreateViewKanbanFieldMetadataIdForeignKeyMigrationCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
      this.logger.log('Skipping kanban field metadata id foreign key creation');

      return;
    }

    if (!options.dryRun) {
      try {
        await this.coreDataSource.query(
          `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_b3cc95732479f7a1337350c398f" FOREIGN KEY ("kanbanAggregateOperationFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        this.logger.log(
          'Successfully added foreign key constraint for kanbanAggregateOperationFieldMetadataId',
        );
      } catch (error) {
        this.logger.log(
          `Foreign key constraint already exists or could not be created (this is expected for subsequent workspaces): ${error.message}`,
        );
      }
    }

    this.hasRunOnce = true;
  }
}
