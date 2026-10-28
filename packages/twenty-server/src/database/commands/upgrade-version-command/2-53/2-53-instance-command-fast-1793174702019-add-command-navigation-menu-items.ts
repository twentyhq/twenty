import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.53.0', 1793174702019)
export class AddCommandNavigationMenuItemsFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "CHK_navigation_menu_item_type_fields"',
    );
    await queryRunner.query(
      'ALTER TYPE "core"."navigationMenuItem_type_enum" RENAME TO "navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"navigationMenuItem_type_enum\" AS ENUM('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD', 'PAGE_LAYOUT', 'AGENT_CHAT_CHANNEL', 'TAB', 'SECTION', 'AI_CHAT_TRIAGE', 'AI_CHAT_FAVORITES', 'AI_CHAT_RECENTS', 'AI_AGENTS', 'AI_CHAT_CHANNELS', 'COMMANDS', 'COMMAND')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" TYPE "core"."navigationMenuItem_type_enum" USING "type"::"text"::"core"."navigationMenuItem_type_enum"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ADD "commandKey" text',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_type_fields" CHECK (("type" = 'FOLDER') OR ("type" = 'TAB') OR ("type" = 'SECTION') OR ("type" = 'AI_CHAT_TRIAGE') OR ("type" = 'AI_CHAT_FAVORITES') OR ("type" = 'AI_CHAT_RECENTS') OR ("type" = 'AI_AGENTS') OR ("type" = 'AI_CHAT_CHANNELS') OR ("type" = 'COMMANDS') OR ("type" = 'OBJECT' AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'VIEW' AND "viewId" IS NOT NULL) OR ("type" = 'RECORD' AND "targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'LINK' AND "link" IS NOT NULL) OR ("type" = 'PAGE_LAYOUT' AND "pageLayoutId" IS NOT NULL) OR ("type" = 'AGENT_CHAT_CHANNEL' AND "agentChatChannelId" IS NOT NULL) OR ("type" = 'COMMAND' AND "commandKey" IS NOT NULL))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "CHK_navigation_menu_item_type_fields"',
    );
    await queryRunner.query(
      `DELETE FROM "core"."navigationMenuItem" WHERE "type" IN ('COMMANDS', 'COMMAND')`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "commandKey"',
    );
    await queryRunner.query(
      'ALTER TYPE "core"."navigationMenuItem_type_enum" RENAME TO "navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"navigationMenuItem_type_enum\" AS ENUM('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD', 'PAGE_LAYOUT', 'AGENT_CHAT_CHANNEL', 'TAB', 'SECTION', 'AI_CHAT_TRIAGE', 'AI_CHAT_FAVORITES', 'AI_CHAT_RECENTS', 'AI_AGENTS', 'AI_CHAT_CHANNELS')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" TYPE "core"."navigationMenuItem_type_enum" USING "type"::"text"::"core"."navigationMenuItem_type_enum"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_type_fields" CHECK (("type" = 'FOLDER') OR ("type" = 'TAB') OR ("type" = 'SECTION') OR ("type" = 'AI_CHAT_TRIAGE') OR ("type" = 'AI_CHAT_FAVORITES') OR ("type" = 'AI_CHAT_RECENTS') OR ("type" = 'AI_AGENTS') OR ("type" = 'AI_CHAT_CHANNELS') OR ("type" = 'OBJECT' AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'VIEW' AND "viewId" IS NOT NULL) OR ("type" = 'RECORD' AND "targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'LINK' AND "link" IS NOT NULL) OR ("type" = 'PAGE_LAYOUT' AND "pageLayoutId" IS NOT NULL) OR ("type" = 'AGENT_CHAT_CHANNEL' AND "agentChatChannelId" IS NOT NULL))`,
    );
  }
}
