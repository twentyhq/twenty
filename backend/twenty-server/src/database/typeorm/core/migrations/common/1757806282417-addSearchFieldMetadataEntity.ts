import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddSearchFieldMetadataEntity1757806282417
  implements MigrationInterface
{
  name = 'AddSearchFieldMetadataEntity1757806282417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."searchFieldMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "objectMetadataId" uuid NOT NULL, "fieldMetadataId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workspaceId" uuid NOT NULL, CONSTRAINT "IDX_SEARCH_FIELD_METADATA_OBJECT_FIELD_UNIQUE" UNIQUE ("objectMetadataId", "fieldMetadataId"), CONSTRAINT "PK_085190eb7531f4aeb8ccab3f42c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_SEARCH_FIELD_METADATA_OBJECT_METADATA_ID" ON "core"."searchFieldMetadata" ("objectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_SEARCH_FIELD_METADATA_WORKSPACE_ID" ON "core"."searchFieldMetadata" ("workspaceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "FK_1b78544eb06f82059a2a01013a3" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "FK_6d5c6922bfd1578b1eff2abb9d6" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT "FK_6d5c6922bfd1578b1eff2abb9d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT "FK_1b78544eb06f82059a2a01013a3"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_SEARCH_FIELD_METADATA_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_SEARCH_FIELD_METADATA_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."searchFieldMetadata"`);
  }
}
