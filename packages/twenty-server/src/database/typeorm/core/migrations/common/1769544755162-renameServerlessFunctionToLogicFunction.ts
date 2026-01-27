import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameServerlessFunctionToLogicFunction1769544755162
  implements MigrationInterface
{
  name = 'RenameServerlessFunctionToLogicFunction1769544755162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename serverlessFunctionLayer table to logicFunctionLayer
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunctionLayer" RENAME TO "logicFunctionLayer"`,
    );

    // Rename serverlessFunction table to logicFunction
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" RENAME TO "logicFunction"`,
    );

    // Rename serverlessFunctionLayerId column in logicFunction table
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" RENAME COLUMN "serverlessFunctionLayerId" TO "logicFunctionLayerId"`,
    );

    // Rename serverlessFunctionLayerId column in application table
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "serverlessFunctionLayerId" TO "logicFunctionLayerId"`,
    );

    // Rename defaultServerlessFunctionRoleId column in application table
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "defaultServerlessFunctionRoleId" TO "defaultLogicFunctionRoleId"`,
    );

    // Rename indexes on logicFunction table
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_SERVERLESS_FUNCTION_ID_DELETED_AT" RENAME TO "IDX_LOGIC_FUNCTION_ID_DELETED_AT"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_SERVERLESS_FUNCTION_LAYER_ID" RENAME TO "IDX_LOGIC_FUNCTION_LAYER_ID"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename indexes back
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_LOGIC_FUNCTION_LAYER_ID" RENAME TO "IDX_SERVERLESS_FUNCTION_LAYER_ID"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_LOGIC_FUNCTION_ID_DELETED_AT" RENAME TO "IDX_SERVERLESS_FUNCTION_ID_DELETED_AT"`,
    );

    // Rename defaultLogicFunctionRoleId column back in application table
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "defaultLogicFunctionRoleId" TO "defaultServerlessFunctionRoleId"`,
    );

    // Rename logicFunctionLayerId column back in application table
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "logicFunctionLayerId" TO "serverlessFunctionLayerId"`,
    );

    // Rename logicFunctionLayerId column back in logicFunction table
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" RENAME COLUMN "logicFunctionLayerId" TO "serverlessFunctionLayerId"`,
    );

    // Rename logicFunction table back to serverlessFunction
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" RENAME TO "serverlessFunction"`,
    );

    // Rename logicFunctionLayer table back to serverlessFunctionLayer
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" RENAME TO "serverlessFunctionLayer"`,
    );
  }
}
