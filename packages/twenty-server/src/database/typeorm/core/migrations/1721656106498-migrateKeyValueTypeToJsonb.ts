import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateKeyValueTypeToJsonb1721656106498
  implements MigrationInterface
{
  name = 'MigrateKeyValueTypeToJsonb1721656106498';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" RENAME COLUMN "value" TO "textValueDeprecated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ADD "value" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" DROP COLUMN "value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" RENAME COLUMN "textValueDeprecated" TO "value"`,
    );
  }
}
