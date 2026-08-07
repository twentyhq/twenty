import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.30.0', 1786133467428)
export class AddInboxTransitionsFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_INBOX_ITEM_DEDUPE_KEY_OPEN_UNIQUE"',
    );
    // Renamed rather than dropped and re-added, so items routed before this
    // command keep the slot they already occupy
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" RENAME COLUMN "dedupeKey" TO "slotKey"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItemType" ADD "resolution" jsonb',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."inboxItem" ADD "version" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" ADD "outcome" character varying',
    );
    await queryRunner.query('ALTER TABLE "core"."inboxItem" ADD "result" jsonb');
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" ADD "cancellationReason" character varying',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" ADD "claimedByUserWorkspaceId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" ADD "claimExpiresAt" TIMESTAMP WITH TIME ZONE',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID_STATUS"',
    );

    // Going through text lets the existing DONE and DISMISSED rows be mapped
    // onto the new names, which a direct enum cast could not do
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" ALTER COLUMN "status" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" ALTER COLUMN "status" TYPE text USING "status"::text',
    );
    await queryRunner.query(
      'ALTER TYPE "core"."inboxItem_status_enum" RENAME TO "inboxItem_status_enum_old"',
    );
    await queryRunner.query(
      `CREATE TYPE "core"."inboxItem_status_enum" AS ENUM('OPEN', 'RESOLVED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `UPDATE "core"."inboxItem" SET "status" = 'RESOLVED' WHERE "status" = 'DONE'`,
    );
    await queryRunner.query(
      `UPDATE "core"."inboxItem" SET "status" = 'CANCELLED' WHERE "status" = 'DISMISSED'`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" ALTER COLUMN "status" TYPE "core"."inboxItem_status_enum" USING "status"::"core"."inboxItem_status_enum"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."inboxItem" ALTER COLUMN "status" SET DEFAULT 'OPEN'`,
    );
    await queryRunner.query('DROP TYPE "core"."inboxItem_status_enum_old"');

    await queryRunner.query(
      'CREATE INDEX "IDX_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID_STATUS" ON "core"."inboxItem" ("assigneeUserWorkspaceId", "status") ',
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_INBOX_ITEM_SLOT_KEY_OPEN_UNIQUE" ON "core"."inboxItem" ("workspaceId", "assigneeUserWorkspaceId", "slotKey") WHERE "status" = 'OPEN' AND "slotKey" IS NOT NULL AND "assigneeUserWorkspaceId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_INBOX_ITEM_SLOT_KEY_OPEN_UNIQUE"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID_STATUS"',
    );

    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" ALTER COLUMN "status" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" ALTER COLUMN "status" TYPE text USING "status"::text',
    );
    await queryRunner.query(
      `UPDATE "core"."inboxItem" SET "status" = 'DONE' WHERE "status" = 'RESOLVED'`,
    );
    await queryRunner.query(
      `UPDATE "core"."inboxItem" SET "status" = 'DISMISSED' WHERE "status" = 'CANCELLED'`,
    );
    await queryRunner.query('DROP TYPE "core"."inboxItem_status_enum"');
    await queryRunner.query(
      `CREATE TYPE "core"."inboxItem_status_enum" AS ENUM('OPEN', 'DONE', 'DISMISSED')`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" ALTER COLUMN "status" TYPE "core"."inboxItem_status_enum" USING "status"::"core"."inboxItem_status_enum"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."inboxItem" ALTER COLUMN "status" SET DEFAULT 'OPEN'`,
    );

    await queryRunner.query(
      'CREATE INDEX "IDX_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID_STATUS" ON "core"."inboxItem" ("status", "assigneeUserWorkspaceId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" DROP COLUMN "claimExpiresAt"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" DROP COLUMN "claimedByUserWorkspaceId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" DROP COLUMN "cancellationReason"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" DROP COLUMN "result"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" DROP COLUMN "outcome"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" DROP COLUMN "version"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItemType" DROP COLUMN "resolution"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxItem" RENAME COLUMN "slotKey" TO "dedupeKey"',
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_INBOX_ITEM_DEDUPE_KEY_OPEN_UNIQUE" ON "core"."inboxItem" ("workspaceId", "assigneeUserWorkspaceId", "dedupeKey") WHERE "status" = 'OPEN' AND "dedupeKey" IS NOT NULL AND "assigneeUserWorkspaceId" IS NOT NULL`,
    );
  }
}
