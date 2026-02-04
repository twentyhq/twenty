import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveObjectMetadataStandardId1770040351718
  implements MigrationInterface
{
  name = 'RemoveObjectMetadataStandardId1770040351718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "standardId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "standardId" uuid`,
    );
  }
}
