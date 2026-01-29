import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveLogicFunctionVersionColumns1769600000000
  implements MigrationInterface
{
  name = 'RemoveLogicFunctionVersionColumns1769600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP COLUMN IF EXISTS "latestVersion"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP COLUMN IF EXISTS "publishedVersions"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD "publishedVersions" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD "latestVersion" character varying`,
    );
  }
}
