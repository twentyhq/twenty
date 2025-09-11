import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddVirtualFieldColumnToFieldMetadata1757290000000
  implements MigrationInterface
{
  name = 'AddVirtualFieldColumnToFieldMetadata1757290000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "virtualField" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN "virtualField"`,
    );
  }
}
