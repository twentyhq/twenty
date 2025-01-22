import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTargetFieldMetadataIdToFieldMetadata1737475217124
  implements MigrationInterface
{
  name = 'AddTargetFieldMetadataIdToFieldMetadata1737475217124';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" ADD "targetFieldMetadataId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" DROP COLUMN "targetFieldMetadataId"`,
    );
  }
}
