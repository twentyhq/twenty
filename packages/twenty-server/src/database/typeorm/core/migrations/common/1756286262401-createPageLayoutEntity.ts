import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreatePageLayoutEntity1756286262401 implements MigrationInterface {
  name = 'CreatePageLayoutEntity1756286262401';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."pageLayout_type_enum" AS ENUM('RECORD_INDEX', 'RECORD_PAGE', 'DASHBOARD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."pageLayout" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "workspaceId" uuid NOT NULL, "type" "core"."pageLayout_type_enum" NOT NULL DEFAULT 'RECORD_PAGE', "objectMetadataId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5028ccb46ffa0c945d2f9246dfa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_OBJECT_METADATA_ID" ON "core"."pageLayout" ("objectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_WORKSPACE_ID" ON "core"."pageLayout" ("workspaceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ADD CONSTRAINT "FK_760ec8b78721991220b76accd55" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ADD CONSTRAINT "FK_dd63ca42614bacf58971aabdcbb" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP CONSTRAINT "FK_dd63ca42614bacf58971aabdcbb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP CONSTRAINT "FK_760ec8b78721991220b76accd55"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_PAGE_LAYOUT_WORKSPACE_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."pageLayout"`);
    await queryRunner.query(`DROP TYPE "core"."pageLayout_type_enum"`);
  }
}
