import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexMetadataWorkspaceObjectCompositeIndex1748843862307
  implements MigrationInterface
{
  name = 'AddIndexMetadataWorkspaceObjectCompositeIndex1748843862307';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."indexMetadata" ("workspaceId", "objectMetadataId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID"`,
    );
  }
}
