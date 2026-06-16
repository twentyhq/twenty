import { type MigrationInterface, type QueryRunner } from 'typeorm';

// The core."searchFieldMetadata" table is dormant (empty in every environment),
// so adding NOT NULL columns without a backfill is safe here.
export class AddUniversalIdentifierAndApplicationIdToSearchFieldMetadata1774800000000 implements MigrationInterface {
  name =
    'AddUniversalIdentifierAndApplicationIdToSearchFieldMetadata1774800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" ADD "universalIdentifier" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" ADD "applicationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_SEARCH_FIELD_METADATA_WORKSPACE_UNIVERSAL_IDENTIFIER_UNIQUE" ON "core"."searchFieldMetadata" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "FK_SEARCH_FIELD_METADATA_APPLICATION_ID" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT "FK_SEARCH_FIELD_METADATA_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_SEARCH_FIELD_METADATA_WORKSPACE_UNIVERSAL_IDENTIFIER_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" DROP COLUMN "universalIdentifier"`,
    );
  }
}
