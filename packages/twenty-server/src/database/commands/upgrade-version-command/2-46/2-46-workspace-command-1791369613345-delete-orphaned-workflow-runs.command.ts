import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const ORPHANED_WORKFLOW_RUN_CONDITION = `
  run."deletedAt" IS NULL
  AND (
    (
      run."coreWorkflowId" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM core."workflow" workflow
        WHERE workflow.id = run."coreWorkflowId"
      )
    )
    OR (
      run."coreWorkflowVersionId" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM core."workflowVersion" version
        WHERE version.id = run."coreWorkflowVersionId"
      )
    )
  )`;

@RegisteredWorkspaceCommand('2.46.0', 1791369613345)
@Command({
  name: 'upgrade:2-46:delete-orphaned-workflow-runs',
  description:
    'Delete the live workflow runs whose core workflow or version was deleted before deletions removed their runs',
})
export class DeleteOrphanedWorkflowRunsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
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

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const coreIdColumns: { column_name: string }[] = await dataSource.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = $1
         AND table_name = 'workflowRun'
         AND column_name IN ('coreWorkflowId', 'coreWorkflowVersionId')`,
      [schemaName],
    );

    if (coreIdColumns.length < 2) {
      return;
    }

    const workflowRunTable = `${escapeIdentifier(schemaName)}."workflowRun"`;

    if (options.dryRun) {
      const [{ count }]: [{ count: number }] = await dataSource.query(
        `SELECT COUNT(*)::int AS count FROM ${workflowRunTable} run WHERE ${ORPHANED_WORKFLOW_RUN_CONDITION}`,
      );

      this.logger.log(
        `[DRY RUN] Would delete ${count} orphaned workflow run(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const [{ hasChatHistory }]: [{ hasChatHistory: boolean }] =
      await dataSource.query(
        `SELECT to_regclass($1) IS NOT NULL AS "hasChatHistory"`,
        [`${escapeIdentifier(schemaName)}."agentMessagePart"`],
      );

    // suspend-paused-agent-steps runs first and may have suspended an agent
    // step of these runs. Its suspension would block the conversation for
    // good, and its pending calls would keep waiting on a caller that is
    // gone, so an answer goes back to being a chat reply
    const unmarkAwaitedCallsSql = hasChatHistory
      ? `, unmarked AS (
           UPDATE ${escapeIdentifier(schemaName)}."agentMessagePart" part
           SET "toolOutput" = part."toolOutput" - 'awaitedByCaller'
           FROM ${escapeIdentifier(schemaName)}."agentMessage" message, released
           WHERE part."messageId" = message.id
             AND message."threadId" = released."threadId"
             AND jsonb_typeof(part."toolOutput") = 'object'
             AND part."toolOutput" -> 'result' ->> 'status' = 'pending'
         )`
      : '';

    const deletedRuns: { id: string }[] = await dataSource.query(
      `WITH deleted AS (
         DELETE FROM ${workflowRunTable} run WHERE ${ORPHANED_WORKFLOW_RUN_CONDITION} RETURNING run.id
       ), released AS (
         DELETE FROM "core"."agentRunSuspension" suspension
         USING deleted
         WHERE suspension."workspaceId" = $1
           AND suspension.caller ->> 'type' = 'WORKFLOW_STEP'
           AND suspension.caller -> 'ref' ->> 'workflowRunId' = deleted.id::text
         RETURNING suspension."threadId"
       )${unmarkAwaitedCallsSql} SELECT id FROM deleted`,
      [workspaceId],
    );

    this.logger.log(
      `Deleted ${deletedRuns.length} orphaned workflow run(s) for workspace ${workspaceId}`,
    );
  }
}
