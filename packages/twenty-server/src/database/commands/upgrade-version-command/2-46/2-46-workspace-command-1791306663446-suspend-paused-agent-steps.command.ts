import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { buildWorkflowAgentRunSpec } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-workflow-agent-run-spec.util';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type PausedAgentStep = {
  workflowRunId: string;
  stepId: string;
  threadId: string;
  step: WorkflowAiAgentAction;
  applicationId: string | null;
  summary: object | null;
};

// An agent step that paused on a question before 2.46 is PENDING with its conversation on
// stepInfo.threadId, and was continued by running the step again. The engine now continues the
// agent itself, so the step gets the suspension the engine continues it from, and its pending
// calls the mark that hands their answer to it.
@RegisteredWorkspaceCommand('2.46.0', 1791306663446)
@Command({
  name: 'upgrade:2-46:suspend-paused-agent-steps',
  description:
    'Give agent steps paused on a question the suspension the engine continues them from',
})
export class SuspendPausedAgentStepsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly storage: AgentHistoryUpgradeStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

    const suspendedCount = await this.storage.run(
      workspaceId,
      async ({ manager, table }) => {
        const pausedSteps: PausedAgentStep[] = await manager.query(
          `SELECT run.id AS "workflowRunId", step.key AS "stepId",
             step.value ->> 'threadId' AS "threadId", flow_step.value AS "step",
             run."createdByContext" ->> 'applicationId' AS "applicationId",
             CASE WHEN run."stepLogs" -> step.key -> 'details' ->> 'type' = 'AI_AGENT'
               THEN (run."stepLogs" -> step.key -> 'details') - 'type' END AS "summary"
           FROM ${schema}."workflowRun" run
           CROSS JOIN LATERAL jsonb_each(COALESCE(run.state -> 'stepInfos', '{}'::jsonb)) AS step(key, value)
           JOIN LATERAL jsonb_array_elements(run.state -> 'flow' -> 'steps') AS flow_step(value)
             ON flow_step.value ->> 'id' = step.key
           WHERE run.status = 'RUNNING'
             AND run."deletedAt" IS NULL
             AND step.value ->> 'status' = 'PENDING'
             AND step.value ->> 'threadId' IS NOT NULL
             AND flow_step.value ->> 'type' = 'AI_AGENT'`,
        );

        if (pausedSteps.length === 0 || (options.dryRun ?? false)) {
          return pausedSteps.length;
        }

        await manager.query(
          `UPDATE ${table('agentMessagePart')} part
           SET "toolOutput" = part."toolOutput" || '{"awaitedByCaller": true}'::jsonb
           FROM ${table('agentMessage')} message
           WHERE part."messageId" = message.id
             AND message."threadId" = ANY($1::uuid[])
             AND jsonb_typeof(part."toolOutput") = 'object'
             AND part."toolOutput" -> 'result' ->> 'status' = 'pending'`,
          [pausedSteps.map(({ threadId }) => threadId)],
        );

        for (const pausedStep of pausedSteps) {
          await manager.query(
            `INSERT INTO "core"."agentRunSuspension" ("workspaceId", "threadId", "caller", "runSpec", "summary")
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT ("threadId") DO NOTHING`,
            [
              workspaceId,
              pausedStep.threadId,
              JSON.stringify({
                type: 'WORKFLOW_STEP',
                ref: {
                  workflowRunId: pausedStep.workflowRunId,
                  stepId: pausedStep.stepId,
                },
              }),
              JSON.stringify(
                buildWorkflowAgentRunSpec({
                  step: pausedStep.step,
                  isApplicationBound: isDefined(pausedStep.applicationId),
                }),
              ),
              isDefined(pausedStep.summary)
                ? JSON.stringify(pausedStep.summary)
                : null,
            ],
          );
        }

        return pausedSteps.length;
      },
    );

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] Would suspend' : 'Suspended'} ${suspendedCount} paused agent step(s) in workspace ${workspaceId}`,
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // A step left with its suspension is still continued by the engine
  }
}
