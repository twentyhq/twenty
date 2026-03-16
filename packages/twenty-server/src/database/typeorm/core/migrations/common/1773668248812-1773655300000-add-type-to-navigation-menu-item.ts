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
      END
      FROM "core"."view" v
      WHERE nmi."viewId" = v.id
    `);

    await queryRunner.query(`
      UPDATE "core"."navigationMenuItem"
      SET "type" = 'FOLDER'
      WHERE "type" IS NULL
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
