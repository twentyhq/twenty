import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class DropWorkspaceDatabaseUrlColumn1774688563000
  implements MigrationInterface
{
  name = 'DropWorkspaceDatabaseUrlColumn1774688563000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN IF EXISTS "databaseUrl"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "databaseSchema" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "databaseSchema" DROP DEFAULT`,
    );
    await queryRunner.query(
      `UPDATE "core"."workspace" SET "databaseSchema" = NULL WHERE "databaseSchema" = ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."workspace" SET "databaseSchema" = '' WHERE "databaseSchema" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "databaseSchema" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "databaseSchema" SET DEFAULT ''`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "databaseUrl" character varying NOT NULL DEFAULT ''`,
    );
  }
}
