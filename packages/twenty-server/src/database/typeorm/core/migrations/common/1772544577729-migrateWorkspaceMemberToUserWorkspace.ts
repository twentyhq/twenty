import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class MigrateWorkspaceMemberToUserWorkspace1772544577729
  implements MigrationInterface
{
  name = 'MigrateWorkspaceMemberToUserWorkspace1772544577729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "firstName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "lastName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "avatarUrl" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."userWorkspace_colorscheme_enum" AS ENUM('DARK', 'LIGHT', 'SYSTEM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "colorScheme" "core"."userWorkspace_colorscheme_enum" NOT NULL DEFAULT 'SYSTEM'`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."userWorkspace_calendarstartday_enum" AS ENUM('SYSTEM', 'SUNDAY', 'MONDAY', 'SATURDAY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "calendarStartDay" "core"."userWorkspace_calendarstartday_enum" NOT NULL DEFAULT 'SYSTEM'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "timeZone" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."userWorkspace_dateformat_enum" AS ENUM('SYSTEM', 'MONTH_FIRST', 'DAY_FIRST', 'YEAR_FIRST')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "dateFormat" "core"."userWorkspace_dateformat_enum" NOT NULL DEFAULT 'SYSTEM'`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."userWorkspace_timeformat_enum" AS ENUM('SYSTEM', 'HOUR_12', 'HOUR_24')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "timeFormat" "core"."userWorkspace_timeformat_enum" NOT NULL DEFAULT 'SYSTEM'`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."userWorkspace_numberformat_enum" AS ENUM('SYSTEM', 'COMMAS_AND_DOT', 'SPACES_AND_COMMA', 'DOTS_AND_COMMA', 'APOSTROPHE_AND_DOT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "numberFormat" "core"."userWorkspace_numberformat_enum" NOT NULL DEFAULT 'SYSTEM'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "numberFormat"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."userWorkspace_numberformat_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "timeFormat"`,
    );
    await queryRunner.query(`DROP TYPE "core"."userWorkspace_timeformat_enum"`);
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "dateFormat"`,
    );
    await queryRunner.query(`DROP TYPE "core"."userWorkspace_dateformat_enum"`);
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "timeZone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "calendarStartDay"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."userWorkspace_calendarstartday_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "colorScheme"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."userWorkspace_colorscheme_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "avatarUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "lastName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "firstName"`,
    );
  }
}
