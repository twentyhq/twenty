import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameApplicationColumn1759433496458
  implements MigrationInterface
{
  name = 'RenameApplicationColumn1759433496458';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "label" TO "name"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "name" TO "label"`,
    );
  }
}
