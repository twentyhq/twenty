import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddFieldMetadataStorageColumn1760458320000
  implements MigrationInterface
{
  name = 'AddFieldMetadataStorageColumn1760458320000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD COLUMN "storage" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN "storage"`,
    );
  }
}
