import { InjectRepository } from '@nestjs/typeorm';

import { isString } from 'class-validator';
import { Command } from 'nest-commander';
import {
  convertViewFilterOperandToCoreOperand,
  isDefined,
} from 'twenty-shared/utils';
import { Raw, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { isWorkflowFilterAction } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/guards/is-workflow-filter-action.guard';
import { isWorkflowFindRecordsAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-find-records-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
@Command({
  name: 'upgrade:1-8:migrate-workflow-step-filter-operand-value',
  description:
    'Migrate workflowVersion.steps[].settings.input.stepFilters[].operand to use new operand enum',
})
export class MigrateWorkflowStepFilterOperandValueCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    index,
    total,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `[${index + 1}/${total}] Migrating workflow step filter operand values for workspace ${workspaceId}`,
    );

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersionsToMigrate = await workflowVersionRepository.find({
      where: [
        {
          steps: Raw(
            (_alias) => `"workflowVersion"."steps"::text LIKE :search`,
            {
              search: '%operand%',
            },
          ),
        },
      ],
    });

    this.logger.log(
      `Found ${workflowVersionsToMigrate.length} workflowVersions to migrate`,
    );

    for (const workflowVersion of workflowVersionsToMigrate) {
      let steps: WorkflowAction[] | null | undefined;

      steps = workflowVersion.steps;

      let hasChanged = false;

      for (const step of steps ?? []) {
        if (isWorkflowFilterAction(step)) {
          for (const filter of step.settings.input.stepFilters ?? []) {
            if (isDefined(filter.operand) && isString(filter.operand)) {
              const newOperand = convertViewFilterOperandToCoreOperand(
                filter.operand,
              );

              if (newOperand && newOperand !== filter.operand) {
                filter.operand = newOperand;
                hasChanged = true;
              }
            }
          }
        }
        if (isWorkflowFindRecordsAction(step)) {
          for (const filter of step.settings.input.filter?.recordFilters ??
            []) {
            if (isString(filter.operand)) {
              const newOperand = convertViewFilterOperandToCoreOperand(
                filter.operand,
              );

              if (newOperand && newOperand !== filter.operand) {
                filter.operand = newOperand;
                hasChanged = true;
              }
            }
          }
        }
      }

      if (hasChanged) {
        this.logger.log(
          `${options.dryRun ? 'DRY RUN - Would be' : ''}Updating workflowVersion ${workflowVersion.id} in workspace ${workspaceId}`,
        );

        if (!options.dryRun) {
          await workflowVersionRepository.update(
            { id: workflowVersion.id },
            { steps },
          );
        }

        this.logger.log(
          `${options.dryRun ? 'DRY RUN - Would have' : ''} Updated workflowVersion ${workflowVersion.id} in workspace ${workspaceId}`,
        );
      }
    }
  }
}
