import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdentifierFieldToObjectMetadata1700565712112
  implements MigrationInterface
{
  name = 'AddIdentifierFieldToObjectMetadata1700565712112';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD "labelIdentifierFieldMetadataId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD "imageIdentifierFieldMetadataId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP COLUMN "imageIdentifierFieldMetadataId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP COLUMN "labelIdentifierFieldMetadataId"`,
    );
  }
}
