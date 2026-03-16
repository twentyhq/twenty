import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeToNavigationMenuItem1773668248812
  implements MigrationInterface
{
  name = 'AddTypeToNavigationMenuItem1773668248812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD "type" text`,
    );

    await queryRunner.query(`
      UPDATE "core"."navigationMenuItem"
      SET "type" = CASE
        WHEN "viewId" IS NOT NULL THEN 'view'
        WHEN "targetRecordId" IS NOT NULL THEN 'record'
        WHEN "link" IS NOT NULL AND TRIM("link") <> '' THEN 'link'
        ELSE 'folder'
      END
    `);

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "type"`,
    );
  }
}
