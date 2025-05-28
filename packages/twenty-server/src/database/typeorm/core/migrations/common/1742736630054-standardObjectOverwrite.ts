import { MigrationInterface, QueryRunner } from 'typeorm';

export class StandardObjectOverwrite1742736630054
  implements MigrationInterface
{
  name = 'StandardObjectOverwrite1742736630054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "standardOverrides" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "standardOverrides" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "standardOverrides"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN "standardOverrides"`,
    );
  }
}
