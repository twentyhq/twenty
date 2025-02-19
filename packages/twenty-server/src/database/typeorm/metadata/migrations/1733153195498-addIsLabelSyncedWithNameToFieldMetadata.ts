import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsLabelSyncedWithNameToFieldMetadata1733153195498
  implements MigrationInterface
{
  name = 'AddIsLabelSyncedWithNameToFieldMetadata1733153195498';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" ADD "isLabelSyncedWithName" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" DROP COLUMN "isLabelSyncedWithName"`,
    );
  }
}
