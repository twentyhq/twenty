import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class DropObjectMetadataDataSourceFk1775802804626
  implements MigrationInterface
{
  name = 'DropObjectMetadataDataSourceFk1775802804626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT IF EXISTS "FK_0b19dd17369574578bc18c405b2"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_OBJECT_METADATA_DATA_SOURCE_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ALTER COLUMN "dataSourceId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ALTER COLUMN "dataSourceId" SET NOT NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_OBJECT_METADATA_DATA_SOURCE_ID" ON "core"."objectMetadata" ("dataSourceId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "FK_0b19dd17369574578bc18c405b2" FOREIGN KEY ("dataSourceId") REFERENCES "core"."dataSource"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
