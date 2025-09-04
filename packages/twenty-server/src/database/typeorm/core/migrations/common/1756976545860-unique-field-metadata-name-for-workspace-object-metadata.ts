import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UniqueFieldMetadataNameForWorkspaceObjectMetadata1756976545860
  implements MigrationInterface
{
  name = 'UniqueFieldMetadataNameForWorkspaceObjectMetadata1756976545860';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "IDX_FIELD_METADATA_NAME_OBJECT_METADATA_ID_WORKSPACE_ID_UNIQUE" UNIQUE ("name", "objectMetadataId", "workspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "IDX_FIELD_METADATA_NAME_OBJECT_METADATA_ID_WORKSPACE_ID_UNIQUE"`,
    );
  }
}
