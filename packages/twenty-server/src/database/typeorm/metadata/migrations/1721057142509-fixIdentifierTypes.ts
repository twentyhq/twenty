import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixIdentifierTypes1721057142509 implements MigrationInterface {
  name = 'FixIdentifierTypes1721057142509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ALTER COLUMN "labelIdentifierFieldMetadataId" TYPE uuid USING "labelIdentifierFieldMetadataId"::uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ALTER COLUMN "imageIdentifierFieldMetadataId" TYPE uuid USING "imageIdentifierFieldMetadataId"::uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ALTER COLUMN "labelIdentifierFieldMetadataId" TYPE text USING "labelIdentifierFieldMetadataId"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ALTER COLUMN "imageIdentifierFieldMetadataId" TYPE text USING "imageIdentifierFieldMetadataId"::text`,
    );
  }
}
