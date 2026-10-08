import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const SUSPENSION_PAYLOAD_SQL = `jsonb_build_object('caller', suspension.caller, 'runSpec', suspension."runSpec",
  'summary', suspension.summary, 'continuationCount', suspension."resumeCount")`;

// A suspended run becomes the AGENT_RUN wake-up of its conversation, keyed RUN so the conversation
// holds one, with the run in its payload: a run waiting on time or an event keeps its wake-up, and one
// paused on a question waits on an ANSWER wake-up. A workflow step waiting on a call it posted waits on its own ANSWER wake-up
@RegisteredInstanceCommand('2.46.0', 1791438611737, { type: 'slow' })
export class MoveAgentRunSuspensionsToPendingWakeUpsSlowInstanceCommand implements SlowInstanceCommand {
  // every statement can run again, so a migration that stopped halfway completes on the next run
  async runDataMigration(dataSource: DataSource): Promise<void> {
    // a run waits on its latest wait, and a conversation keeps one wake-up per run
    await dataSource.query(
      `DELETE FROM "core"."pendingWakeUp" wake_up USING "core"."pendingWakeUp" newer
       WHERE wake_up."ownerType" = 'AGENT_RUN' AND newer."ownerType" = 'AGENT_RUN'
         AND newer."ownerId" = wake_up."ownerId"
         AND (newer."createdAt", newer.id) > (wake_up."createdAt", wake_up.id)`,
    );
    await dataSource.query(
      `UPDATE "core"."pendingWakeUp" wake_up
       SET "ownerId" = suspension."threadId", "ownerKey" = 'RUN', "payload" = ${SUSPENSION_PAYLOAD_SQL}
       FROM "core"."agentRunSuspension" suspension
       WHERE wake_up."ownerType" = 'AGENT_RUN' AND wake_up."ownerId" = suspension.id
         AND suspension."runSpec" IS NOT NULL`,
    );
    await dataSource.query(
      `INSERT INTO "core"."pendingWakeUp" ("workspaceId", "ownerType", "ownerId", "ownerKey", "condition", "payload")
       SELECT suspension."workspaceId", 'AGENT_RUN', suspension."threadId", 'RUN',
         jsonb_build_object('type', 'ANSWER', 'threadId', suspension."threadId"), ${SUSPENSION_PAYLOAD_SQL}
       FROM "core"."agentRunSuspension" suspension
       WHERE suspension."runSpec" IS NOT NULL
       ON CONFLICT ("ownerType", "ownerId", "ownerKey") DO NOTHING`,
    );
    await dataSource.query(
      `INSERT INTO "core"."pendingWakeUp" ("workspaceId", "ownerType", "ownerId", "ownerKey", "condition")
       SELECT suspension."workspaceId", 'WORKFLOW_STEP', (suspension.caller -> 'ref' ->> 'workflowRunId')::uuid,
         suspension.caller -> 'ref' ->> 'stepId', jsonb_build_object('type', 'ANSWER', 'threadId', suspension."threadId")
       FROM "core"."agentRunSuspension" suspension
       WHERE suspension."runSpec" IS NULL AND suspension.caller ->> 'type' = 'WORKFLOW_STEP'
       ON CONFLICT ("ownerType", "ownerId", "ownerKey") DO NOTHING`,
    );
    // a wait whose run is gone has nothing left to wake up
    await dataSource.query(
      `DELETE FROM "core"."pendingWakeUp" WHERE "ownerType" = 'AGENT_RUN' AND "payload" IS NULL`,
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "core"."agentRunSuspension"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "core"."agentRunSuspension" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "threadId" uuid NOT NULL, "caller" jsonb NOT NULL, "runSpec" jsonb, "summary" jsonb, "resumeCount" integer NOT NULL DEFAULT \'0\', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_AGENT_RUN_SUSPENSION_THREAD_ID" UNIQUE ("threadId"), CONSTRAINT "PK_ffa8fcfd24c5a8e0122f5a682af" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentRunSuspension" ADD CONSTRAINT "FK_3005d9ef8e9f321e387a8ac0b6a" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );

    await queryRunner.query(
      `INSERT INTO "core"."agentRunSuspension" ("workspaceId", "threadId", "caller", "runSpec", "summary", "resumeCount")
       SELECT "workspaceId", "ownerId", "payload" -> 'caller', "payload" -> 'runSpec',
         NULLIF("payload" -> 'summary', 'null'::jsonb), ("payload" ->> 'continuationCount')::integer
       FROM "core"."pendingWakeUp" WHERE "ownerType" = 'AGENT_RUN'`,
    );
    await queryRunner.query(
      `INSERT INTO "core"."agentRunSuspension" ("workspaceId", "threadId", "caller")
       SELECT "workspaceId", ("condition" ->> 'threadId')::uuid, jsonb_build_object('type', 'WORKFLOW_STEP',
         'ref', jsonb_build_object('workflowRunId', "ownerId", 'stepId', "ownerKey"))
       FROM "core"."pendingWakeUp" WHERE "ownerType" = 'WORKFLOW_STEP' AND "condition" ->> 'type' = 'ANSWER'
       ON CONFLICT ("threadId") DO NOTHING`,
    );
    await queryRunner.query(
      `DELETE FROM "core"."pendingWakeUp" WHERE "condition" ->> 'type' = 'ANSWER'`,
    );

    await queryRunner.query(
      `UPDATE "core"."pendingWakeUp" wake_up SET "ownerId" = suspension.id
       FROM "core"."agentRunSuspension" suspension
       WHERE wake_up."ownerType" = 'AGENT_RUN' AND wake_up."ownerId" = suspension."threadId"`,
    );

    const suspensions: { id: string; workspaceId: string; threadId: string }[] =
      await queryRunner.query(
        'SELECT id, "workspaceId", "threadId" FROM "core"."agentRunSuspension"',
      );

    // the previous shape hands an answer to a run through a mark on its pending calls, and keys a wait by its call
    for (const { id, workspaceId, threadId } of suspensions) {
      const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
      const isPendingPartOfThread = `message.id = part."messageId" AND message."threadId" = $1
        AND part."toolOutput" -> 'result' ->> 'status' = 'pending'`;

      await queryRunner.query(
        `UPDATE ${schemaName}."agentMessagePart" part
         SET "toolOutput" = part."toolOutput" || '{"awaitedByCaller": true}'::jsonb
         FROM ${schemaName}."agentMessage" message WHERE ${isPendingPartOfThread}`,
        [threadId],
      );
      await queryRunner.query(
        `UPDATE "core"."pendingWakeUp" wake_up SET "ownerKey" = part."toolCallId"
         FROM ${schemaName}."agentMessagePart" part, ${schemaName}."agentMessage" message
         WHERE ${isPendingPartOfThread} AND part."toolName" IN ('wait_for_event', 'wait_for_duration')
           AND wake_up."ownerType" = 'AGENT_RUN' AND wake_up."ownerId" = $2`,
        [threadId, id],
      );
    }
  }
}
