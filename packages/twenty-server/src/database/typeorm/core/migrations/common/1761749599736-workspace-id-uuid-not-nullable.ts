import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class WorkspaceIdUuidNotNullable1761749599736
  implements MigrationInterface
{
  name = 'WorkspaceIdUuidNotNullable1761749599736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_b27c681286ac581f81498c5d4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP CONSTRAINT "IDX_INDEX_METADATA_NAME_WORKSPACE_ID_OBJECT_METADATA_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP COLUMN "workspaceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD "workspaceId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b27c681286ac581f81498c5d4b" ON "core"."indexMetadata" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."indexMetadata" ("workspaceId", "objectMetadataId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD CONSTRAINT "IDX_INDEX_METADATA_NAME_WORKSPACE_ID_OBJECT_METADATA_ID_UNIQUE" UNIQUE ("name", "workspaceId", "objectMetadataId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP CONSTRAINT "IDX_INDEX_METADATA_NAME_WORKSPACE_ID_OBJECT_METADATA_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_b27c681286ac581f81498c5d4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP COLUMN "workspaceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD "workspaceId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD CONSTRAINT "IDX_INDEX_METADATA_NAME_WORKSPACE_ID_OBJECT_METADATA_ID_UNIQUE" UNIQUE ("name", "workspaceId", "objectMetadataId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b27c681286ac581f81498c5d4b" ON "core"."indexMetadata" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."indexMetadata" ("workspaceId", "objectMetadataId") `,
    );
  }
}
