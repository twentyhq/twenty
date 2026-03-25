import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameServerless1769556947746 implements MigrationInterface {
  name = 'RenameServerless1769556947746';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunctionLayer" RENAME TO "logicFunctionLayer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" RENAME TO "logicFunction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" RENAME COLUMN "serverlessFunctionLayerId" TO "logicFunctionLayerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "serverlessFunctionLayerId" TO "logicFunctionLayerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "defaultServerlessFunctionRoleId" TO "defaultLogicFunctionRoleId"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_SERVERLESS_FUNCTION_ID_DELETED_AT" RENAME TO "IDX_LOGIC_FUNCTION_ID_DELETED_AT"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_SERVERLESS_FUNCTION_LAYER_ID" RENAME TO "IDX_LOGIC_FUNCTION_LAYER_ID"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_LOGIC_FUNCTION_LAYER_ID" RENAME TO "IDX_SERVERLESS_FUNCTION_LAYER_ID"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_LOGIC_FUNCTION_ID_DELETED_AT" RENAME TO "IDX_SERVERLESS_FUNCTION_ID_DELETED_AT"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "defaultLogicFunctionRoleId" TO "defaultServerlessFunctionRoleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "logicFunctionLayerId" TO "serverlessFunctionLayerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" RENAME COLUMN "logicFunctionLayerId" TO "serverlessFunctionLayerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" RENAME TO "serverlessFunction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" RENAME TO "serverlessFunctionLayer"`,
    );
  }
}
