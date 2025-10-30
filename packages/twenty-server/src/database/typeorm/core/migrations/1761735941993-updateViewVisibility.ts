import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateViewVisibility1761735941993 implements MigrationInterface {
  name = 'UpdateViewVisibility1761735941993';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."view" ADD "roleId" uuid`);
    await queryRunner.query(
      `ALTER TYPE "core"."view_visibility_enum" RENAME TO "view_visibility_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_visibility_enum" AS ENUM('WORKSPACE', 'RESTRICTED', 'LINK_ONLY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "visibility" DROP DEFAULT`,
    );
    await queryRunner.query(
      `UPDATE "core"."view" SET "visibility" = 'LINK_ONLY' WHERE "visibility" = 'USER'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "visibility" TYPE "core"."view_visibility_enum" USING "visibility"::"text"::"core"."view_visibility_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "visibility" SET DEFAULT 'WORKSPACE'`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_visibility_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "core"."pageLayoutWidget_type_enum" RENAME TO "pageLayoutWidget_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."pageLayoutWidget_type_enum" AS ENUM('VIEW', 'IFRAME', 'FIELDS', 'GRAPH', 'TIMELINE', 'TASKS', 'NOTES', 'FILES', 'EMAILS', 'CALENDAR', 'RICH_TEXT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "type" TYPE "core"."pageLayoutWidget_type_enum" USING "type"::"text"::"core"."pageLayoutWidget_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "type" SET DEFAULT 'VIEW'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."pageLayoutWidget_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_dc778c3f34a4ff9e577cdee3603" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_dc778c3f34a4ff9e577cdee3603"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."pageLayoutWidget_type_enum_old" AS ENUM('CALENDAR', 'EMAILS', 'FIELDS', 'FILES', 'GRAPH', 'IFRAME', 'NOTES', 'TASKS', 'TIMELINE', 'VIEW')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "type" TYPE "core"."pageLayoutWidget_type_enum_old" USING "type"::"text"::"core"."pageLayoutWidget_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "type" SET DEFAULT 'VIEW'`,
    );
    await queryRunner.query(`DROP TYPE "core"."pageLayoutWidget_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "core"."pageLayoutWidget_type_enum_old" RENAME TO "pageLayoutWidget_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_visibility_enum_old" AS ENUM('USER', 'WORKSPACE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "visibility" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "visibility" TYPE "core"."view_visibility_enum_old" USING "visibility"::"text"::"core"."view_visibility_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "visibility" SET DEFAULT 'WORKSPACE'`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_visibility_enum"`);
    await queryRunner.query(
      `ALTER TYPE "core"."view_visibility_enum_old" RENAME TO "view_visibility_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "core"."view" DROP COLUMN "roleId"`);
  }
}
