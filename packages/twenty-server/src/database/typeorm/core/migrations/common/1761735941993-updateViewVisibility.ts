import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateViewVisibility1761735941993 implements MigrationInterface {
  name = 'UpdateViewVisibility1761735941993';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."view_visibility_enum" AS ENUM('WORKSPACE', 'UNLISTED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "visibility" "core"."view_visibility_enum" NOT NULL DEFAULT 'WORKSPACE'`,
    );
    await queryRunner.query(`ALTER TABLE "core"."view" ADD "createdById" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_VISIBILITY" ON "core"."view" ("visibility")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_view_createdBy" FOREIGN KEY ("createdById") REFERENCES "core"."userWorkspace"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_view_createdBy"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_VISIBILITY"`);
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "createdById"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "visibility"`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_visibility_enum"`);
  }
}
