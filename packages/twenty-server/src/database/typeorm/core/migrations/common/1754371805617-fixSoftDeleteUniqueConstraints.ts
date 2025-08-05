import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSoftDeleteUniqueConstraints1754371805617
  implements MigrationInterface
{
  name = 'FixSoftDeleteUniqueConstraints1754371805617';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "IDX_USER_WORKSPACE_USER_ID_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP CONSTRAINT "IDX_AGENT_NAME_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP CONSTRAINT "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP CONSTRAINT "IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_USER_WORKSPACE_USER_ID_WORKSPACE_ID_UNIQUE" ON "core"."userWorkspace" ("userId", "workspaceId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_AGENT_NAME_WORKSPACE_ID_UNIQUE" ON "core"."agent" ("name", "workspaceId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewField" ("fieldMetadataId", "viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewSort" ("fieldMetadataId", "viewId") WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_AGENT_NAME_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_USER_WORKSPACE_USER_ID_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD CONSTRAINT "IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE" UNIQUE ("fieldMetadataId", "viewId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE" UNIQUE ("fieldMetadataId", "viewId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD CONSTRAINT "IDX_AGENT_NAME_WORKSPACE_ID_UNIQUE" UNIQUE ("name", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "IDX_USER_WORKSPACE_USER_ID_WORKSPACE_ID_UNIQUE" UNIQUE ("userId", "workspaceId")`,
    );
  }
}
