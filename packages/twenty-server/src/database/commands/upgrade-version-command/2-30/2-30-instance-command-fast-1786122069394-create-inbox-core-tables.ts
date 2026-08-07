import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.30.0', 1786122069394)
export class CreateInboxCoreTablesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."inboxItemType_binding_enum" AS ENUM ('SUBJECT', 'OCCURRENCE'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."inboxItemType_defaultpriority_enum" AS ENUM ('NEEDS_ACTION', 'UPDATE', 'LOW'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."inboxItem_status_enum" AS ENUM ('OPEN', 'DONE', 'DISMISSED'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."inboxItem_priority_enum" AS ENUM ('NEEDS_ACTION', 'UPDATE', 'LOW'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."inboxItemType" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "universalIdentifier" uuid NOT NULL,
        "applicationId" uuid NOT NULL,
        "key" character varying NOT NULL,
        "label" character varying NOT NULL,
        "icon" character varying,
        "binding" "core"."inboxItemType_binding_enum" NOT NULL DEFAULT 'OCCURRENCE',
        "defaultPriority" "core"."inboxItemType_defaultpriority_enum" NOT NULL DEFAULT 'UPDATE',
        "actions" jsonb NOT NULL DEFAULT '[]',
        "detailFrontComponentId" uuid,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inboxItemType_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_INBOX_ITEM_TYPE_WORKSPACE_ID" FOREIGN KEY ("workspaceId")
          REFERENCES "core"."workspace"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_INBOX_ITEM_TYPE_APPLICATION_ID" FOREIGN KEY ("applicationId")
          REFERENCES "core"."application"("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_TYPE_KEY_WORKSPACE_ID_UNIQUE"
        ON "core"."inboxItemType" ("key", "workspaceId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_TYPE_WORKSPACE_ID_UNIVERSAL_IDENTIFIER_UNIQUE"
        ON "core"."inboxItemType" ("workspaceId", "universalIdentifier")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_TYPE_APPLICATION_ID"
        ON "core"."inboxItemType" ("applicationId")`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."inboxItem" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "inboxItemTypeId" uuid NOT NULL,
        "status" "core"."inboxItem_status_enum" NOT NULL DEFAULT 'OPEN',
        "priority" "core"."inboxItem_priority_enum" NOT NULL DEFAULT 'UPDATE',
        "title" character varying NOT NULL,
        "preview" character varying,
        "payload" jsonb,
        "readAt" TIMESTAMP WITH TIME ZONE,
        "snoozedUntil" TIMESTAMP WITH TIME ZONE,
        "threadId" uuid,
        "subjectObjectMetadataId" uuid,
        "subjectRecordId" uuid,
        "assigneeUserWorkspaceId" uuid,
        "assigneeAgentId" uuid,
        "dedupeKey" character varying,
        "resolvedAt" TIMESTAMP WITH TIME ZONE,
        "resolvedByUserWorkspaceId" uuid,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inboxItem_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_INBOX_ITEM_SINGLE_ASSIGNEE"
          CHECK (("assigneeUserWorkspaceId" IS NOT NULL) != ("assigneeAgentId" IS NOT NULL)),
        CONSTRAINT "FK_INBOX_ITEM_WORKSPACE_ID" FOREIGN KEY ("workspaceId")
          REFERENCES "core"."workspace"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_INBOX_ITEM_INBOX_ITEM_TYPE_ID" FOREIGN KEY ("inboxItemTypeId")
          REFERENCES "core"."inboxItemType"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_INBOX_ITEM_THREAD_ID" FOREIGN KEY ("threadId")
          REFERENCES "core"."agentChatThread"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID" FOREIGN KEY ("assigneeUserWorkspaceId")
          REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE
      )`,
    );

    // One live item per dedupe key and assignee: this is what makes concurrent
    // producers fold into a single item instead of duplicating it.
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_DEDUPE_KEY_OPEN_UNIQUE"
        ON "core"."inboxItem" ("workspaceId", "assigneeUserWorkspaceId", "dedupeKey")
        WHERE "status" = 'OPEN' AND "dedupeKey" IS NOT NULL AND "assigneeUserWorkspaceId" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID_STATUS"
        ON "core"."inboxItem" ("assigneeUserWorkspaceId", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_WORKSPACE_ID"
        ON "core"."inboxItem" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_THREAD_ID"
        ON "core"."inboxItem" ("threadId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."inboxItem"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."inboxItemType"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."inboxItem_priority_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."inboxItem_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."inboxItemType_defaultpriority_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."inboxItemType_binding_enum"`,
    );
  }
}
