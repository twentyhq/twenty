import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsLabelSyncedWithNameToFieldMetadata1733072126592
  implements MigrationInterface
{
  name = 'AddIsLabelSyncedWithNameToFieldMetadata1733072126592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" ADD "isLabelSyncedWithName" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" DROP COLUMN "isLabelSyncedWithName"`,
    );
  }
}
