import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateLogicFunctionDefault1769710304101
  implements MigrationInterface
{
  name = 'UpdateLogicFunctionDefault1769710304101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ALTER COLUMN "builtHandlerPath" SET DEFAULT 'src/index.mjs'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ALTER COLUMN "builtHandlerPath" SET DEFAULT 'index.mjs'`,
    );
  }
}
