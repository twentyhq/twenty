import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeToNavigationMenuItem1773668248812
  implements MigrationInterface
{
  name = 'AddTypeToNavigationMenuItem1773668248812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."navigationMenuItem_type_enum" AS ENUM('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD')`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD "type" "core"."navigationMenuItem_type_enum"`,
    );

    await queryRunner.query(`
      UPDATE "core"."navigationMenuItem" nmi
      SET "type" = CASE
        WHEN nmi."targetRecordId" IS NOT NULL THEN 'RECORD'
        WHEN nmi."link" IS NOT NULL AND TRIM(nmi."link") <> '' THEN 'LINK'
        WHEN nmi."viewId" IS NOT NULL THEN
          CASE
            WHEN v."key" = 'INDEX' THEN 'OBJECT'
            ELSE 'VIEW'
          END
        ELSE 'FOLDER'
      END::"core"."navigationMenuItem_type_enum"
      FROM "core"."view" v
      WHERE nmi."viewId" = v.id
    `);

    await queryRunner.query(`
      UPDATE "core"."navigationMenuItem"
      SET "type" = 'FOLDER'::"core"."navigationMenuItem_type_enum"
      WHERE "type" IS NULL
    `);

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT "CHK_navigation_menu_item_target_fields"`,
    );

    await queryRunner.query(`
      UPDATE "core"."navigationMenuItem" nmi
      SET
        "targetObjectMetadataId" = v."objectMetadataId",
        "viewId" = NULL,
        "color" = NULL
      FROM "core"."view" v
      WHERE nmi."type" = 'OBJECT'::"core"."navigationMenuItem_type_enum"
        AND nmi."viewId" = v.id
    `);

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_target_fields" CHECK ("targetRecordId" IS NULL OR "targetObjectMetadataId" IS NOT NULL)`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT "CHK_navigation_menu_item_target_fields"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_target_fields" CHECK (("targetRecordId" IS NULL AND "targetObjectMetadataId" IS NULL) OR ("targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL))`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "type"`,
    );

    await queryRunner.query(`DROP TYPE "core"."navigationMenuItem_type_enum"`);
  }
}
