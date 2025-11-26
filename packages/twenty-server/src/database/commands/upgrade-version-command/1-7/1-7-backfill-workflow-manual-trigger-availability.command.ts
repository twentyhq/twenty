import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Command({
  name: 'upgrade:1-7:backfill-workflow-manual-trigger-availability',
  description:
    'Backfill workflow manual trigger availability based on objectType',
})
export class BackfillWorkflowManualTriggerAvailabilityCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    const workflowVersions = await this.coreDataSource.query(
      `SELECT * FROM ${schemaName}."workflowVersion"`,
    );

    for (const workflowVersion of workflowVersions) {
      const { trigger } = workflowVersion;

      if (!isDefined(trigger) || trigger?.type !== WorkflowTriggerType.MANUAL) {
        continue;
      }

      const availability = trigger.settings.availability;
      const objectType = trigger.settings.objectType;

      if (isDefined(availability)) {
        continue;
      }

      const newAvailability = objectType
        ? {
            type: 'SINGLE_RECORD',
            objectNameSingular: objectType,
          }
        : {
            type: 'GLOBAL',
            locations: [],
          };

      const updatedTrigger = {
        ...trigger,
        settings: {
          ...trigger.settings,
          availability: newAvailability,
        },
      };

      this.logger.log(
        `Updating workflow version ${workflowVersion.id} with new availability ${JSON.stringify(
          newAvailability,
        )}`,
      );

      await this.coreDataSource.query(
        `UPDATE ${schemaName}."workflowVersion" SET trigger = $1 WHERE id = $2`,
        [updatedTrigger, workflowVersion.id],
      );
    }
  }
}
