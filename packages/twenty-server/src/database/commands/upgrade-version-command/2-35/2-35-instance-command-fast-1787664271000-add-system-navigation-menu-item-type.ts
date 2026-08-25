import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.35.0', 1787664271000)
export class AddSystemNavigationMenuItemTypeFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ADD COLUMN IF NOT EXISTS "systemPage" text',
    );

    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "CHK_navigation_menu_item_type_fields"',
    );

    await queryRunner.query(
      'ALTER TYPE "core"."navigationMenuItem_type_enum" RENAME TO "navigationMenuItem_type_enum_old"',
    );

    await queryRunner.query(
      `CREATE TYPE "core"."navigationMenuItem_type_enum" AS ENUM ('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD', 'PAGE_LAYOUT', 'SYSTEM')`,
    );

    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" TYPE "core"."navigationMenuItem_type_enum" USING "type"::text::"core"."navigationMenuItem_type_enum"',
    );

    await queryRunner.query(
      'DROP TYPE "core"."navigationMenuItem_type_enum_old"',
    );

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_type_fields" CHECK (("type" = 'FOLDER') OR ("type" = 'OBJECT' AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'VIEW' AND "viewId" IS NOT NULL) OR ("type" = 'RECORD' AND "targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'LINK' AND "link" IS NOT NULL) OR ("type" = 'PAGE_LAYOUT' AND "pageLayoutId" IS NOT NULL) OR ("type" = 'SYSTEM' AND "systemPage" IS NOT NULL))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "core"."navigationMenuItem" WHERE "type" = 'SYSTEM'`,
    );

    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "CHK_navigation_menu_item_type_fields"',
    );

    await queryRunner.query(
      'ALTER TYPE "core"."navigationMenuItem_type_enum" RENAME TO "navigationMenuItem_type_enum_old"',
    );

    await queryRunner.query(
      `CREATE TYPE "core"."navigationMenuItem_type_enum" AS ENUM ('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD', 'PAGE_LAYOUT')`,
    );

    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" TYPE "core"."navigationMenuItem_type_enum" USING "type"::text::"core"."navigationMenuItem_type_enum"',
    );

    await queryRunner.query(
      'DROP TYPE "core"."navigationMenuItem_type_enum_old"',
    );

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_type_fields" CHECK (("type" = 'FOLDER') OR ("type" = 'OBJECT' AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'VIEW' AND "viewId" IS NOT NULL) OR ("type" = 'RECORD' AND "targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'LINK' AND "link" IS NOT NULL) OR ("type" = 'PAGE_LAYOUT' AND "pageLayoutId" IS NOT NULL))`,
    );

    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP COLUMN IF EXISTS "systemPage"',
    );
  }
}
