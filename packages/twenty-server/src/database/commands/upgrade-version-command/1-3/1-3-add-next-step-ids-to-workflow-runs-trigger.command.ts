import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

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
    workspaceId: _,
  }: RunOnWorkspaceArgs): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    for (const activeWorkspace of activeWorkspaces) {
      const schemaName = getWorkspaceSchemaName(activeWorkspace.id);
      const workflowRuns = await mainDataSource.query(
        `SELECT id, state FROM ${schemaName}."workflowRun"`,
      );

      for (const workflowRun of workflowRuns) {
        try {
          const rootSteps = this.getRootSteps(
            workflowRun.state.flow.steps || [],
          );

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
            `UPDATE ${schemaName}."workflowRun" SET state = '${JSON.stringify(updatedState)}'::jsonb`,
          );
        } catch (error) {
          this.logger.error(
            `Error while adding nextStepIds to workflowRun state '${workflowRun.id}'`,
            error,
          );
        }
      }
      this.logger.log(`${workflowRuns.length} triggers updated`);
    }
  }

  private getRootSteps(steps: WorkflowAction[]): WorkflowAction[] {
    const childIds = new Set<string>();

    for (const step of steps) {
      step.nextStepIds?.forEach((id) => childIds.add(id));
    }

    return steps.filter((step) => !childIds.has(step.id));
  }
}
