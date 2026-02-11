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
      `ALTER TABLE "core"."logicFunction" DROP COLUMN "builtHandlerPath"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD "builtHandlerPath" character varying NOT NULL DEFAULT 'src/index.mjs'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP COLUMN "isBuildUpToDate"`,
    );
  }
}
