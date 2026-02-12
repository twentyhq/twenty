import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveLogicFunctionVersion1769681396664
  implements MigrationInterface
{
  name = 'RemoveLogicFunctionVersion1769681396664';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP COLUMN "latestVersion"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP COLUMN "publishedVersions"`,
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
