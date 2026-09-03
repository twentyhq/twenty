import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.38.0', 1788435600000)
export class AddInboxItemToolCallsFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."inboxItemToolCall_status_enum" AS ENUM ('PROPOSED', 'REJECTED', 'EXECUTED', 'FAILED'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."inboxItemToolCall" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "inboxItemId" uuid NOT NULL,
        "position" integer NOT NULL,
        "toolName" character varying NOT NULL,
        "label" character varying NOT NULL,
        "description" character varying,
        "icon" character varying,
        "inputSchema" jsonb NOT NULL DEFAULT '[]',
        "proposedInput" jsonb NOT NULL DEFAULT '{}',
        "editedInput" jsonb,
        "status" "core"."inboxItemToolCall_status_enum" NOT NULL DEFAULT 'PROPOSED',
        "output" jsonb,
        "error" text,
        "resolvedByUserWorkspaceId" uuid,
        "resolvedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_INBOX_ITEM_TOOL_CALL_ID" PRIMARY KEY ("id"),
        CONSTRAINT "FK_INBOX_ITEM_TOOL_CALL_WORKSPACE_ID"
          FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_INBOX_ITEM_TOOL_CALL_INBOX_ITEM_ID"
          FOREIGN KEY ("inboxItemId") REFERENCES "core"."inboxItem"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_TOOL_CALL_INBOX_ITEM_ID_POSITION"
        ON "core"."inboxItemToolCall" ("inboxItemId", "position")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_TOOL_CALL_WORKSPACE_ID"
        ON "core"."inboxItemToolCall" ("workspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."inboxItemToolCall"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."inboxItemToolCall_status_enum"`,
    );
  }
}
