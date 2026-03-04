import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Command({
  name: 'upgrade:1-19:migrate-workflow-relation-fields',
  description:
    'Migrate workflow CREATE_RECORD and UPSERT_RECORD steps from legacy relation format (e.g. company: { id: "uuid" }) to join column format (e.g. companyId: "uuid")',
})
export class MigrateWorkflowRelationFieldsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    MigrateWorkflowRelationFieldsCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `Running MigrateWorkflowRelationFieldsCommand for workspace ${workspaceId}`,
    );

    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersions = await workflowVersionRepository.find({
      select: ['id', 'steps'],
    });

    let migratedCount = 0;

    for (const version of workflowVersions) {
      if (!Array.isArray(version.steps) || version.steps.length === 0) {
        continue;
      }

      const { migratedSteps, hasChanges } = migrateWorkflowSteps(version.steps);

      if (!hasChanges) {
        continue;
      }

      migratedCount++;

      if (isDryRun) {
        this.logger.log(
          `[DRY RUN] Would migrate workflow version ${version.id} in workspace ${workspaceId}`,
        );
      } else {
        await workflowVersionRepository.update(
          { id: version.id },
          { steps: migratedSteps },
        );

        this.logger.log(
          `Migrated workflow version ${version.id} in workspace ${workspaceId}`,
        );
      }
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would have migrated' : 'Migrated'} ${migratedCount} workflow version(s) in workspace ${workspaceId}`,
    );
  }
}

const migrateWorkflowSteps = (
  steps: Record<string, unknown>[],
): { migratedSteps: Record<string, unknown>[]; hasChanges: boolean } => {
  let hasChanges = false;

  const migratedSteps = steps.map((step) => {
    if (
      step.type !== WorkflowActionType.CREATE_RECORD &&
      step.type !== WorkflowActionType.UPSERT_RECORD
    ) {
      return step;
    }

    const input = (step.settings as Record<string, unknown>)?.input as Record<
      string,
      unknown
    >;
    const objectRecord = input?.objectRecord as Record<string, unknown>;

    if (!isDefined(objectRecord)) {
      return step;
    }

    const migratedRecord: Record<string, unknown> = {};
    let recordChanged = false;

    for (const [key, value] of Object.entries(objectRecord)) {
      const isLegacyRelationValue =
        isDefined(value) &&
        !Array.isArray(value) &&
        typeof value === 'object' &&
        Object.keys(value).length === 1 &&
        typeof (value as Record<string, unknown>).id === 'string';

      if (!isLegacyRelationValue) {
        migratedRecord[key] = value;
        continue;
      }

      const joinColumnKey = `${key}Id`;

      if (joinColumnKey in objectRecord) {
        continue;
      }

      migratedRecord[joinColumnKey] = (value as Record<string, unknown>).id;
      recordChanged = true;
    }

    if (!recordChanged) {
      return step;
    }

    hasChanges = true;

    return {
      ...step,
      settings: {
        ...(step.settings as Record<string, unknown>),
        input: {
          ...input,
          objectRecord: migratedRecord,
        },
      },
    };
  });

  return { migratedSteps, hasChanges };
};
