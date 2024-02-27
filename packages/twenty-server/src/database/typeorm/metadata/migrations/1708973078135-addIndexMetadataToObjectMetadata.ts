import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexMetadataToObjectMetadata1708973078135
  implements MigrationInterface
{
  name = 'AddIndexMetadataToObjectMetadata1708973078135';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD "indexMetadata" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP COLUMN "indexMetadata"`,
    );
  }
}
