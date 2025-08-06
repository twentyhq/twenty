import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Command({
  name: 'upgrade:1-3:add-next-step-ids-to-workflow-runs-trigger',
  description: 'Add next step ids to workflow runs trigger',
})
export class AddNextStepIdsToWorkflowRunsTrigger extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const workflowRuns = await mainDataSource.query(
      `SELECT id, state FROM ${schemaName}."workflowRun"`,
    );

    let updatedWorkflowRunCount = 0;

    for (const workflowRun of workflowRuns) {
      try {
        if (isDefined(workflowRun.state.flow.trigger.nextStepIds)) {
          continue;
        }

        const rootSteps = this.getRootSteps(workflowRun.state.flow.steps || []);

        const nextStepIds = rootSteps.map((step) => step.id);

        const updatedState = {
          ...workflowRun.state,
          flow: {
            ...workflowRun.state.flow,
            trigger: {
              ...workflowRun.state.flow.trigger,
              nextStepIds,
            },
          },
        };

        await mainDataSource.query(
          `UPDATE ${schemaName}."workflowRun" SET state = $1::jsonb`,
          [updatedState],
        );

        updatedWorkflowRunCount += 1;
      } catch (error) {
        this.logger.error(
          `Error while adding nextStepIds to workflowRun state '${workflowRun.id}'`,
          error,
        );
      }
    }
    this.logger.log(
      `${updatedWorkflowRunCount}/${workflowRuns.length} triggers updated`,
    );
  }

  private getRootSteps(steps: WorkflowAction[]): WorkflowAction[] {
    const childIds = new Set<string>();

    for (const step of steps) {
      step.nextStepIds?.forEach((id) => childIds.add(id));
    }

    return steps.filter((step) => !childIds.has(step.id));
  }
}
