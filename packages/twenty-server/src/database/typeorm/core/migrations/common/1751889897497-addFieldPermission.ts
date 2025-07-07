import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldPermission1751889897497 implements MigrationInterface {
  name = 'AddFieldPermission1751889897497';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP COLUMN "canReadFieldRecords"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP COLUMN "canUpdateFieldRecords"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD "canReadFieldValue" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD "canUpdateFieldValue" boolean`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_OBJECT_PERMISSION_WORKSPACE_ID" ON "core"."objectPermission" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_PERMISSION_WORKSPACE_ID_ROLE_ID" ON "core"."fieldPermission" ("workspaceId", "roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_PERMISSION_WORKSPACE_ID" ON "core"."fieldPermission" ("workspaceId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_PERMISSION_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_PERMISSION_WORKSPACE_ID_ROLE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_OBJECT_PERMISSION_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP COLUMN "canUpdateFieldValue"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP COLUMN "canReadFieldValue"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD "canUpdateFieldRecords" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD "canReadFieldRecords" boolean`,
    );
  }
}
