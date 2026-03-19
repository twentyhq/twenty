import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type LegacyCodeStepInput = {
  serverlessFunctionId: string;
  serverlessFunctionVersion?: string;
  serverlessFunctionInput?: Record<string, unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedStep = Record<string, any>;

const isLegacyCodeStep = (step: UntypedStep): boolean => {
  return (
    step.type === 'CODE' &&
    isDefined(step.settings?.input?.serverlessFunctionId)
  );
};

@Command({
  name: 'upgrade:1-18:migrate-workflow-code-steps',
  description:
    'Migrate workflow CODE steps from legacy serverlessFunction fields to logicFunction fields',
})
export class MigrateWorkflowCodeStepsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(MigrateWorkflowCodeStepsCommand.name);

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
      `${isDryRun ? '[DRY RUN] ' : ''}Running MigrateWorkflowCodeStepsCommand for workspace ${workspaceId}`,
    );

    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersions = await workflowVersionRepository.find({
      select: ['id', 'steps', 'status'],
      where: {
        status: In([
          WorkflowVersionStatus.DRAFT,
          WorkflowVersionStatus.ACTIVE,
          WorkflowVersionStatus.DEACTIVATED,
        ]),
      },
    });

    let migratedCount = 0;

    for (const version of workflowVersions) {
      const steps = version.steps;

      if (!isDefined(steps) || !Array.isArray(steps) || steps.length === 0) {
        continue;
      }

      const untypedSteps = steps as UntypedStep[];
      const hasLegacySteps = untypedSteps.some(isLegacyCodeStep);

      if (!hasLegacySteps) {
        continue;
      }

      const migratedSteps = untypedSteps.map((step) => {
        if (!isLegacyCodeStep(step)) {
          return step;
        }

        const legacyInput = step.settings.input as LegacyCodeStepInput;

        this.logger.log(
          `${isDryRun ? '[DRY RUN] ' : ''}Migrating CODE step ${step.id} in workflow version ${version.id}: ` +
            `serverlessFunctionId=${legacyInput.serverlessFunctionId} → logicFunctionId`,
        );

        return {
          ...step,
          settings: {
            ...step.settings,
            input: {
              logicFunctionId: legacyInput.serverlessFunctionId,
              logicFunctionInput: legacyInput.serverlessFunctionInput ?? {},
            },
          },
        };
      }) as WorkflowAction[];

      if (!isDryRun) {
        await workflowVersionRepository.update(
          { id: version.id },
          { steps: migratedSteps },
        );
      }

      migratedCount++;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Migrated ${migratedCount} workflow version(s) in workspace ${workspaceId}`,
    );
  }
}
