import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type PostedCallRow = {
  workspaceId: string;
  threadId: string;
  workflowRunId: string;
  stepId: string;
};

// A run without a spec was a workflow step waiting on the answer to a call it posted in a
// conversation; such a step now waits with an ANSWER wake-up. A step whose call no longer waits
// has nothing to move
@RegisteredInstanceCommand('2.46.0', 1791417349093)
export class MovePostedCallWaitsToAnswerWakeUpsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const postedCalls: PostedCallRow[] = await queryRunner.query(
      `SELECT "workspaceId", "threadId", caller -> 'ref' ->> 'workflowRunId' AS "workflowRunId",
         caller -> 'ref' ->> 'stepId' AS "stepId"
       FROM "core"."agentRun"
       WHERE "runSpec" IS NULL AND "status" = 'SUSPENDED' AND caller ->> 'type' = 'WORKFLOW_STEP'`,
    );

    for (const { workspaceId, threadId, workflowRunId, stepId } of postedCalls) {
      const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
      const [{ hasChatHistory }]: [{ hasChatHistory: boolean }] =
        await queryRunner.query(
          `SELECT to_regclass($1) IS NOT NULL AND to_regclass($2) IS NOT NULL AS "hasChatHistory"`,
          [
            `${schemaName}."agentChatThread"`,
            `${schemaName}."agentMessagePart"`,
          ],
        );

      if (!hasChatHistory) {
        continue;
      }

      await queryRunner.query(
        `INSERT INTO "core"."pendingWakeUp" ("workspaceId", "ownerType", "ownerId", "ownerKey", "condition")
         SELECT $1::uuid, 'WORKFLOW_STEP', $3::uuid, $4::text,
           jsonb_build_object('type', 'ANSWER', 'threadId', thread.id, 'toolCallId', part."toolCallId")
         FROM ${schemaName}."agentChatThread" thread
         JOIN ${schemaName}."agentMessagePart" part ON part."messageId" = thread."pendingQuestionMessageId"
         WHERE thread.id = $2 AND part."toolCallId" IS NOT NULL
           AND part."toolOutput" -> 'result' ->> 'status' = 'pending'
         LIMIT 1
         ON CONFLICT ("ownerType", "ownerId", "ownerKey") DO NOTHING`,
        [workspaceId, threadId, workflowRunId, stepId],
      );
    }

    await queryRunner.query(
      'DELETE FROM "core"."agentRun" WHERE "runSpec" IS NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentRun" ALTER COLUMN "runSpec" SET NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agentRun" ALTER COLUMN "runSpec" DROP NOT NULL',
    );

    // the previous shape finds a posted call's caller through a run without a spec and the mark on the call
    const answerWaits: (PostedCallRow & { toolCallId: string })[] =
      await queryRunner.query(
        `DELETE FROM "core"."pendingWakeUp"
         WHERE "ownerType" = 'WORKFLOW_STEP' AND "condition" ->> 'type' = 'ANSWER'
         RETURNING "workspaceId", "condition" ->> 'threadId' AS "threadId",
           "condition" ->> 'toolCallId' AS "toolCallId", "ownerId" AS "workflowRunId", "ownerKey" AS "stepId"`,
      );

    for (const {
      workspaceId,
      threadId,
      toolCallId,
      workflowRunId,
      stepId,
    } of answerWaits) {
      await queryRunner.query(
        `INSERT INTO "core"."agentRun" ("workspaceId", "threadId", "caller", "runSpec", "status")
         VALUES ($1::uuid, $2::uuid, jsonb_build_object('type', 'WORKFLOW_STEP', 'ref',
           jsonb_build_object('workflowRunId', $3::text, 'stepId', $4::text)), NULL, 'SUSPENDED')
         ON CONFLICT DO NOTHING`,
        [workspaceId, threadId, workflowRunId, stepId],
      );

      const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
      const [{ hasChatHistory }]: [{ hasChatHistory: boolean }] =
        await queryRunner.query(
          `SELECT to_regclass($1) IS NOT NULL AS "hasChatHistory"`,
          [`${schemaName}."agentMessagePart"`],
        );

      if (hasChatHistory) {
        await queryRunner.query(
          `UPDATE ${schemaName}."agentMessagePart"
           SET "toolOutput" = "toolOutput" || '{"awaitedByCaller": true}'::jsonb
           WHERE "toolCallId" = $1 AND "toolOutput" -> 'result' ->> 'status' = 'pending'`,
          [toolCallId],
        );
      }
    }
  }
}
