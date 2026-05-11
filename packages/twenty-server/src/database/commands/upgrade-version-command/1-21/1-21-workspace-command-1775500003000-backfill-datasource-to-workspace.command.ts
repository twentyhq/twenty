import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';

@RegisteredWorkspaceCommand('1.21.0', 1775500003000)
@Command({
  name: 'upgrade:1-21:backfill-datasource-to-workspace',
  description:
    'Backfill workspace.databaseSchema from the dataSource entity for workspaces that have not been migrated yet',
})
export class BackfillDatasourceToWorkspaceCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(DataSourceEntity)
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!isDefined(workspace)) {
      this.logger.warn(`Workspace ${workspaceId} not found, skipping`);

      return;
    }

    if (isNonEmptyString(workspace.databaseSchema)) {
      this.logger.log(
        `Workspace ${workspaceId} already has databaseSchema="${workspace.databaseSchema}", skipping`,
      );

      return;
    }

    const dataSource = await this.dataSourceRepository.findOne({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });

    if (!isDefined(dataSource)) {
      throw new Error(
        `No dataSource row found for workspace ${workspaceId}. Cannot backfill databaseSchema.`,
      );
    }

    if (!isNonEmptyString(dataSource.schema)) {
      throw new Error(
        `DataSource for workspace ${workspaceId} has an empty schema. Cannot backfill databaseSchema.`,
      );
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
