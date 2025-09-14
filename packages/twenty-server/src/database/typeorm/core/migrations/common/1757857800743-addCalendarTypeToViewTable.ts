import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddCalendarTypeToViewTable1757857800743
  implements MigrationInterface
{
  name = 'AddCalendarTypeToViewTable1757857800743';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."view_calendarlayout_enum" AS ENUM('DAY', 'WEEK', 'MONTH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "calendarLayout" "core"."view_calendarlayout_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."view_type_enum" RENAME TO "view_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_type_enum" AS ENUM('TABLE', 'KANBAN', 'CALENDAR')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" TYPE "core"."view_type_enum" USING "type"::"text"::"core"."view_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" SET DEFAULT 'TABLE'`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."view_type_enum_old" AS ENUM('KANBAN', 'TABLE')`,
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
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "calendarLayout"`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_calendarlayout_enum"`);
  }
}
