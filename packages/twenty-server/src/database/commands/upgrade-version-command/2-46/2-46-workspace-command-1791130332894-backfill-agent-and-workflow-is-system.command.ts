import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Everything the workspace authored itself lives in its custom or standard application
const SYSTEM_OWNED_APPLICATION_PREDICATE = (tableAlias: string) =>
  `${tableAlias}."applicationId" NOT IN (
     SELECT workspace."workspaceCustomApplicationId" FROM core."workspace" workspace WHERE workspace.id = $1
     UNION
     SELECT application.id FROM core."application" application
     WHERE application."workspaceId" = $1 AND application."universalIdentifier" = $2
   )`;

const WORKFLOW_STEP_AGENT_IDS_SUBQUERY = `SELECT step->'settings'->'input'->>'agentId'
   FROM core."workflowVersion" version
   CROSS JOIN LATERAL jsonb_array_elements(version.steps) step
   WHERE version."workspaceId" = $1
     AND jsonb_typeof(version.steps) = 'array'
     AND step->>'type' = 'AI_AGENT'`;

const markSystemAgents = async (
  queryRunner: QueryRunner,
  workspaceId: string,
): Promise<number> => {
  const [rows]: [{ id: string }[], number] = await queryRunner.query(
    `UPDATE core."agent" agent
     SET "isSystem" = true
     WHERE agent."workspaceId" = $1
       AND agent."isSystem" = false
       AND (
         ${SYSTEM_OWNED_APPLICATION_PREDICATE('agent')}
         OR agent.id::text IN (${WORKFLOW_STEP_AGENT_IDS_SUBQUERY})
       )
     RETURNING agent.id`,
    [workspaceId, TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER],
  );

  return rows.length;
};

const markSystemWorkflows = async (
  queryRunner: QueryRunner,
  workspaceId: string,
): Promise<number> => {
  const [rows]: [{ id: string }[], number] = await queryRunner.query(
    `UPDATE core."workflow" workflow
     SET "isSystem" = true
     WHERE workflow."workspaceId" = $1
       AND workflow."isSystem" = false
       AND ${SYSTEM_OWNED_APPLICATION_PREDICATE('workflow')}
     RETURNING workflow.id`,
    [workspaceId, TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER],
  );

  return rows.length;
};

@RegisteredWorkspaceCommand('2.46.0', 1791130332894)
@Command({
  name: 'upgrade:2-46:backfill-agent-and-workflow-is-system',
  description:
    'Flag agents owned by workflow steps or applications, and application workflows, as system',
})
export class BackfillAgentAndWorkflowIsSystemCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would flag workflow and application agents and application workflows as system for workspace ${workspaceId}`,
      );

      return;
    }

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let agentCount: number;
    let workflowCount: number;

    try {
      agentCount = await markSystemAgents(queryRunner, workspaceId);
      workflowCount = await markSystemWorkflows(queryRunner, workspaceId);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }

    if (agentCount > 0 || workflowCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatAgentMaps',
        'flatWorkflowMaps',
      ]);
    }

    this.logger.log(
      `Workspace ${workspaceId}: flagged ${agentCount} agent(s) and ${workflowCount} workflow(s) as system`,
    );
  }
}
