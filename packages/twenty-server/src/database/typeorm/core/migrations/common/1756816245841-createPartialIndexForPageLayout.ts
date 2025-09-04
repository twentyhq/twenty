import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreatePartialIndexForPageLayout1756816245841
  implements MigrationInterface
{
  name = 'CreatePartialIndexForPageLayout1756816245841';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_WORKSPACE_ID_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."pageLayout" ("workspaceId", "objectMetadataId") WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_WORKSPACE_ID_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."pageLayout" ("workspaceId", "objectMetadataId") `,
    );
  }
}
