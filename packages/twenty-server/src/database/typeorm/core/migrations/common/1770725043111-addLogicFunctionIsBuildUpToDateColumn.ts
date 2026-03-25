import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddLogicFunctionIsBuildUpToDateColumn1770725043111
  implements MigrationInterface
{
  name = 'AddLogicFunctionIsBuildUpToDateColumn1770725043111';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD "isBuildUpToDate" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ALTER COLUMN "sourceHandlerPath" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ALTER COLUMN "builtHandlerPath" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ALTER COLUMN "handlerName" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ALTER COLUMN "handlerName" SET DEFAULT 'main'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ALTER COLUMN "builtHandlerPath" SET DEFAULT 'src/index.mjs'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ALTER COLUMN "sourceHandlerPath" SET DEFAULT 'src/index.ts'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP COLUMN "isBuildUpToDate"`,
    );
  }
}
