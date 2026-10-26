import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.51.0', 1793012828076)
export class AddCommandNavigationMenuItemFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "CHK_navigation_menu_item_type_fields"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ADD "commandMenuItemId" uuid',
    );
    await queryRunner.query(
      'ALTER TYPE "core"."navigationMenuItem_type_enum" RENAME TO "navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"navigationMenuItem_type_enum\" AS ENUM('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD', 'PAGE_LAYOUT', 'TAB', 'SECTION', 'AI_CHAT_TRIAGE', 'AI_CHAT_FAVORITES', 'AI_CHAT_RECENTS', 'AI_AGENTS', 'COMMAND')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" TYPE "core"."navigationMenuItem_type_enum" USING "type"::"text"::"core"."navigationMenuItem_type_enum"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_type_fields" CHECK (("type" = 'FOLDER') OR ("type" = 'TAB') OR ("type" = 'SECTION') OR ("type" = 'AI_CHAT_TRIAGE') OR ("type" = 'AI_CHAT_FAVORITES') OR ("type" = 'AI_CHAT_RECENTS') OR ("type" = 'AI_AGENTS') OR ("type" = 'OBJECT' AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'VIEW' AND "viewId" IS NOT NULL) OR ("type" = 'RECORD' AND "targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'LINK' AND "link" IS NOT NULL) OR ("type" = 'PAGE_LAYOUT' AND "pageLayoutId" IS NOT NULL) OR ("type" = 'COMMAND' AND "commandMenuItemId" IS NOT NULL))`,
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_NAVIGATION_MENU_ITEM_COMMAND_MENU_ITEM_ID_WORKSPACE_ID" ON "core"."navigationMenuItem" ("commandMenuItemId", "workspaceId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "FK_c0f27a0d326af8948bcc99d6bb5" FOREIGN KEY ("commandMenuItemId") REFERENCES "core"."commandMenuItem"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT "FK_c0f27a0d326af8948bcc99d6bb5"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_NAVIGATION_MENU_ITEM_COMMAND_MENU_ITEM_ID_WORKSPACE_ID"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "CHK_navigation_menu_item_type_fields"',
    );
    await queryRunner.query(
      `DELETE FROM "core"."navigationMenuItem" WHERE "type" = 'COMMAND'`,
    );
    await queryRunner.query(
      'ALTER TYPE "core"."navigationMenuItem_type_enum" RENAME TO "navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"navigationMenuItem_type_enum\" AS ENUM('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD', 'PAGE_LAYOUT', 'TAB', 'SECTION', 'AI_CHAT_TRIAGE', 'AI_CHAT_FAVORITES', 'AI_CHAT_RECENTS', 'AI_AGENTS')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" TYPE "core"."navigationMenuItem_type_enum" USING "type"::"text"::"core"."navigationMenuItem_type_enum"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_type_fields" CHECK (("type" = 'FOLDER') OR ("type" = 'TAB') OR ("type" = 'SECTION') OR ("type" = 'AI_CHAT_TRIAGE') OR ("type" = 'AI_CHAT_FAVORITES') OR ("type" = 'AI_CHAT_RECENTS') OR ("type" = 'AI_AGENTS') OR ("type" = 'OBJECT' AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'VIEW' AND "viewId" IS NOT NULL) OR ("type" = 'RECORD' AND "targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'LINK' AND "link" IS NOT NULL) OR ("type" = 'PAGE_LAYOUT' AND "pageLayoutId" IS NOT NULL))`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "commandMenuItemId"',
    );
  }
}
