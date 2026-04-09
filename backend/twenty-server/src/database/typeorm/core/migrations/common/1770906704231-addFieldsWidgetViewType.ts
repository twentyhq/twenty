import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddFieldsWidgetViewType1770906704231
  implements MigrationInterface
{
  name = 'AddFieldsWidgetViewType1770906704231';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."view_type_enum" ADD VALUE IF NOT EXISTS 'FIELDS_WIDGET' AFTER 'CALENDAR'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."view_type_enum_old" AS ENUM('CALENDAR', 'KANBAN', 'TABLE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" TYPE "core"."view_type_enum_old" USING "type"::"text"::"core"."view_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" SET DEFAULT 'TABLE'`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "core"."view_type_enum_old" RENAME TO "view_type_enum"`,
    );
  }
}
