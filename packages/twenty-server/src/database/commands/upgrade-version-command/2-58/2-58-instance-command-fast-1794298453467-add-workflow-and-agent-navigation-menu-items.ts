import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.58.0', 1794298453467)
export class AddWorkflowAndAgentNavigationMenuItemsFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ADD COLUMN IF NOT EXISTS "workflowId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ADD COLUMN IF NOT EXISTS "agentId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "CHK_navigation_menu_item_type_fields"',
    );
    await queryRunner.query(
      'ALTER TYPE "core"."navigationMenuItem_type_enum" RENAME TO "navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"navigationMenuItem_type_enum\" AS ENUM('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD', 'PAGE_LAYOUT', 'AGENT_CHAT_CHANNEL', 'NATIVE_PAGE', 'WORKFLOW', 'AGENT')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" TYPE "core"."navigationMenuItem_type_enum" USING "type"::"text"::"core"."navigationMenuItem_type_enum"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_type_fields" CHECK (("type" = 'FOLDER') OR ("type" = 'OBJECT' AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'VIEW' AND "viewId" IS NOT NULL) OR ("type" = 'RECORD' AND "targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'LINK' AND "link" IS NOT NULL) OR ("type" = 'PAGE_LAYOUT' AND "pageLayoutId" IS NOT NULL) OR ("type" = 'AGENT_CHAT_CHANNEL' AND "agentChatChannelId" IS NOT NULL) OR ("type" = 'NATIVE_PAGE' AND "nativePageKey" IS NOT NULL) OR ("type" = 'WORKFLOW' AND "workflowId" IS NOT NULL) OR ("type" = 'AGENT' AND "agentId" IS NOT NULL))`,
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_NAVIGATION_MENU_ITEM_WORKFLOW_ID_WORKSPACE_ID" ON "core"."navigationMenuItem" ("workflowId", "workspaceId") ',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_NAVIGATION_MENU_ITEM_AGENT_ID_WORKSPACE_ID" ON "core"."navigationMenuItem" ("agentId", "workspaceId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "FK_2d41ba0f36326735cb9687456fc"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "FK_2d41ba0f36326735cb9687456fc" FOREIGN KEY ("workflowId") REFERENCES "core"."workflow"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "FK_c8c107480f88215057b8b1c9520"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "FK_c8c107480f88215057b8b1c9520" FOREIGN KEY ("agentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "FK_c8c107480f88215057b8b1c9520"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "FK_2d41ba0f36326735cb9687456fc"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_NAVIGATION_MENU_ITEM_AGENT_ID_WORKSPACE_ID"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_NAVIGATION_MENU_ITEM_WORKFLOW_ID_WORKSPACE_ID"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "CHK_navigation_menu_item_type_fields"',
    );
    await queryRunner.query(
      'DELETE FROM "core"."navigationMenuItem" WHERE "type" IN (\'WORKFLOW\', \'AGENT\')',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"navigationMenuItem_type_enum_old\" AS ENUM('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD', 'PAGE_LAYOUT', 'AGENT_CHAT_CHANNEL', 'NATIVE_PAGE')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" TYPE "core"."navigationMenuItem_type_enum_old" USING "type"::"text"::"core"."navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query('DROP TYPE "core"."navigationMenuItem_type_enum"');
    await queryRunner.query(
      'ALTER TYPE "core"."navigationMenuItem_type_enum_old" RENAME TO "navigationMenuItem_type_enum"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_type_fields" CHECK (("type" = 'FOLDER') OR ("type" = 'OBJECT' AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'VIEW' AND "viewId" IS NOT NULL) OR ("type" = 'RECORD' AND "targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'LINK' AND "link" IS NOT NULL) OR ("type" = 'PAGE_LAYOUT' AND "pageLayoutId" IS NOT NULL) OR ("type" = 'AGENT_CHAT_CHANNEL' AND "agentChatChannelId" IS NOT NULL) OR ("type" = 'NATIVE_PAGE' AND "nativePageKey" IS NOT NULL))`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP COLUMN IF EXISTS "agentId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP COLUMN IF EXISTS "workflowId"',
    );
  }
}
