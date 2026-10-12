import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  buildPausedAgentStepRunSpec,
  type PausedAgentStepDefinition,
} from 'src/database/commands/upgrade-version-command/2-46/suspend-paused-agent-steps-run-spec.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type PausedAgentStep = {
  workflowRunId: string;
  stepId: string;
  threadId: string;
  step: PausedAgentStepDefinition;
  applicationId: string | null;
  summary: object | null;
};

// An agent step that paused on a question before 2.46 is PENDING with its conversation on
// stepInfo.threadId, and was continued by running the step again. The engine now continues the
// agent itself, so the step's conversation gets the ANSWER wake-up holding the run the engine
// continues. A step whose question was answered meanwhile has no call left to resolve that
// wake-up, which would then block its conversation for good, so it gets none.
@RegisteredWorkspaceCommand('2.46.0', 1791306663446)
@Command({
  name: 'upgrade:2-46:suspend-paused-agent-steps',
  description:
    'Give agent steps paused on a question the wake-up the engine continues them from',
})
export class SuspendPausedAgentStepsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly storage: AgentHistoryUpgradeStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.workflowRun.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `workflowRun object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

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
             AND flow_step.value ->> 'type' = 'AI_AGENT'
             AND EXISTS (
               SELECT 1 FROM ${table('agentMessagePart')} part
               JOIN ${table('agentMessage')} message ON message.id = part."messageId"
               WHERE message."threadId" = (step.value ->> 'threadId')::uuid
                 AND jsonb_typeof(part."toolOutput") = 'object'
                 AND part."toolOutput" -> 'result' ->> 'status' = 'pending'
             )`,
        );

        if (pausedSteps.length === 0 || (options.dryRun ?? false)) {
          return pausedSteps.length;
        }

        let suspendedCount = 0;

        // an answer settled between the select and this insert leaves nothing pending, and no wake-up
        for (const pausedStep of pausedSteps) {
          const inserted: { id: string }[] = await manager.query(
            `INSERT INTO "core"."pendingWakeUp" ("workspaceId", "ownerType", "ownerId", "ownerKey", "condition", "payload")
             SELECT $1::uuid, 'AGENT_RUN', $2::uuid, 'RUN', jsonb_build_object('type', 'ANSWER', 'threadId', $2::uuid::text),
               jsonb_build_object('caller', $3::jsonb, 'runSpec', $4::jsonb, 'summary', $5::jsonb, 'continuationCount', 0)
             WHERE EXISTS (
               SELECT 1 FROM ${table('agentMessagePart')} part
               JOIN ${table('agentMessage')} message ON message.id = part."messageId"
               WHERE message."threadId" = $2::uuid
                 AND jsonb_typeof(part."toolOutput") = 'object'
                 AND part."toolOutput" -> 'result' ->> 'status' = 'pending'
             )
             ON CONFLICT ("ownerType", "ownerId", "ownerKey") DO NOTHING
             RETURNING id`,
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
                buildPausedAgentStepRunSpec({
                  step: pausedStep.step,
                  isApplicationBound: isDefined(pausedStep.applicationId),
                }),
              ),
              JSON.stringify(pausedStep.summary),
            ],
          );

          suspendedCount += inserted.length;
        }

        return suspendedCount;
      },
    );

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] Would suspend' : 'Suspended'} ${suspendedCount} paused agent step(s) in workspace ${workspaceId}`,
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // A step left with its wake-up is still continued by the engine
  }
}
