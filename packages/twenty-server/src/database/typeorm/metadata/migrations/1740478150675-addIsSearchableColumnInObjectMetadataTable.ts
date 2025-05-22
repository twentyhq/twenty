import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsSearchableColumnInObjectMetadataTable1740478150675
  implements MigrationInterface
{
  name = 'AddIsSearchableColumnInObjectMetadataTable1740478150675';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "isSearchable" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "isSearchable"`,
    );
  }
}
