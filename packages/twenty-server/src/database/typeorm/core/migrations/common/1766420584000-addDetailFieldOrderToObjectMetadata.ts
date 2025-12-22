import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddDetailFieldOrderToObjectMetadata1766420584000
  implements MigrationInterface
{
  name = 'AddDetailFieldOrderToObjectMetadata1766420584000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "detailFieldOrder" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "detailFieldOrder"`,
    );
  }
}
