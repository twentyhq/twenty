import { MigrationInterface, QueryRunner } from 'typeorm';

export class MorphIndexUpdate1751558024634 implements MigrationInterface {
  name = 'MorphIndexUpdate1751558024634';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "IDX_FIELD_METADATA_NAME_OBJECT_METADATA_ID_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_FIELD_METADATA_NAME_OBJMID_WORKSPACE_ID_EXCEPT_MORPH_UNIQUE" ON "core"."fieldMetadata" ("name", "objectMetadataId", "workspaceId") WHERE "type" <> 'MORPH_RELATION'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_METADATA_NAME_OBJMID_WORKSPACE_ID_EXCEPT_MORPH_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "IDX_FIELD_METADATA_NAME_OBJECT_METADATA_ID_WORKSPACE_ID_UNIQUE" UNIQUE ("name", "objectMetadataId", "workspaceId")`,
    );
  }
}
