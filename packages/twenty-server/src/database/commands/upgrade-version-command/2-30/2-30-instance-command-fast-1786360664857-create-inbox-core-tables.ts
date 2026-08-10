import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.30.0', 1786360664857)
export class CreateInboxCoreTablesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."inboxItemType_defaultpriority_enum" AS ENUM ('NEEDS_ACTION', 'UPDATE'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."inboxItem_priority_enum" AS ENUM ('NEEDS_ACTION', 'UPDATE'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
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
        "defaultPriority" "core"."inboxItemType_defaultpriority_enum" NOT NULL DEFAULT 'UPDATE',
        "actions" jsonb NOT NULL DEFAULT '[]',
        "resolution" jsonb,
        "defaultQueueId" uuid,
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

    // A shared inbox. Work addressed here belongs to nobody until someone takes
    // it, which is the whole difference from a personal inbox.
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."inboxQueue" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "icon" character varying,
        "isDefault" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inboxQueue_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_INBOX_QUEUE_WORKSPACE_ID" FOREIGN KEY ("workspaceId")
          REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_INBOX_QUEUE_WORKSPACE_ID_SLUG_UNIQUE"
        ON "core"."inboxQueue" ("workspaceId", "slug")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_INBOX_QUEUE_WORKSPACE_ID_DEFAULT_UNIQUE"
        ON "core"."inboxQueue" ("workspaceId") WHERE "isDefault"`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."inboxQueueMember" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "queueId" uuid NOT NULL,
        "userWorkspaceId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inboxQueueMember_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_INBOX_QUEUE_MEMBER_WORKSPACE_ID" FOREIGN KEY ("workspaceId")
          REFERENCES "core"."workspace"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_INBOX_QUEUE_MEMBER_QUEUE_ID" FOREIGN KEY ("queueId")
          REFERENCES "core"."inboxQueue"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_INBOX_QUEUE_MEMBER_USER_WORKSPACE_ID" FOREIGN KEY ("userWorkspaceId")
          REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_INBOX_QUEUE_MEMBER_QUEUE_ID_USER_WORKSPACE_ID_UNIQUE"
        ON "core"."inboxQueueMember" ("queueId", "userWorkspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_INBOX_QUEUE_MEMBER_USER_WORKSPACE_ID"
        ON "core"."inboxQueueMember" ("userWorkspaceId")`,
    );

    // No status column: lastEventAt is written by producers, clearedAt by the
    // assignee, and whether the item wants attention is the comparison. Both
    // are stamped with the database clock so the comparison reflects the order
    // Postgres saw the writes in rather than any app server's clock.
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."inboxItem" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "inboxItemTypeId" uuid NOT NULL,
        "priority" "core"."inboxItem_priority_enum" NOT NULL DEFAULT 'UPDATE',
        "title" character varying NOT NULL,
        "preview" character varying,
        "payload" jsonb,
        "lastEventAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp(),
        "clearedAt" TIMESTAMP WITH TIME ZONE,
        "resurfaceAt" TIMESTAMP WITH TIME ZONE,
        "clearedByUserWorkspaceId" uuid,
        "outcome" character varying,
        "result" jsonb,
        "readAt" TIMESTAMP WITH TIME ZONE,
        "threadId" uuid,
        "subjectObjectMetadataId" uuid,
        "subjectRecordId" uuid,
        "queueId" uuid,
        "assigneeUserWorkspaceId" uuid,
        "slotKey" character varying,
        "version" integer NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inboxItem_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_INBOX_ITEM_ADDRESSED"
          CHECK (("queueId" IS NOT NULL) OR ("assigneeUserWorkspaceId" IS NOT NULL)),
        CONSTRAINT "FK_INBOX_ITEM_WORKSPACE_ID" FOREIGN KEY ("workspaceId")
          REFERENCES "core"."workspace"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_INBOX_ITEM_INBOX_ITEM_TYPE_ID" FOREIGN KEY ("inboxItemTypeId")
          REFERENCES "core"."inboxItemType"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_INBOX_ITEM_THREAD_ID" FOREIGN KEY ("threadId")
          REFERENCES "core"."agentChatThread"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_INBOX_ITEM_QUEUE_ID" FOREIGN KEY ("queueId")
          REFERENCES "core"."inboxQueue"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID" FOREIGN KEY ("assigneeUserWorkspaceId")
          REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE
      )`,
    );

    // One row per slot per inbox, for the slot's whole life. Concurrent
    // producers collide here and fold instead of duplicating. A queue's slot
    // belongs to the queue, so taking an item does not change which slot it is.
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_QUEUE_SLOT_KEY_UNIQUE"
        ON "core"."inboxItem" ("workspaceId", "queueId", "slotKey")
        WHERE "slotKey" IS NOT NULL AND "queueId" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_SLOT_KEY_UNIQUE"
        ON "core"."inboxItem" ("workspaceId", "assigneeUserWorkspaceId", "slotKey")
        WHERE "slotKey" IS NOT NULL AND "queueId" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID_LAST_EVENT_AT"
        ON "core"."inboxItem" ("assigneeUserWorkspaceId", "lastEventAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_QUEUE_ID_LAST_EVENT_AT"
        ON "core"."inboxItem" ("queueId", "lastEventAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_WORKSPACE_ID"
        ON "core"."inboxItem" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_INBOX_ITEM_THREAD_ID"
        ON "core"."inboxItem" ("threadId")`,
    );

    // Added once both tables exist, since the type table is created first.
    // Dropped first because Postgres has no ADD CONSTRAINT IF NOT EXISTS, and
    // this command has to survive being re-run.
    await queryRunner.query(
      `ALTER TABLE "core"."inboxItemType"
        DROP CONSTRAINT IF EXISTS "FK_INBOX_ITEM_TYPE_DEFAULT_QUEUE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."inboxItemType"
        ADD CONSTRAINT "FK_INBOX_ITEM_TYPE_DEFAULT_QUEUE_ID"
        FOREIGN KEY ("defaultQueueId")
        REFERENCES "core"."inboxQueue"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."inboxItem"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."inboxQueueMember"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."inboxQueue"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."inboxItemType"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."inboxItem_priority_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."inboxItemType_defaultpriority_enum"`,
    );
  }
}
