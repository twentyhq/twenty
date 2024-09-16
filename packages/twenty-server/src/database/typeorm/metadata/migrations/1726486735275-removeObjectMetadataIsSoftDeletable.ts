import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveObjectMetadataIsSoftDeletable1726486735275
  implements MigrationInterface
{
  name = 'RemoveObjectMetadataIsSoftDeletable1726486735275';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP COLUMN "isSoftDeletable"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD "isSoftDeletable" boolean`,
    );
  }
}
