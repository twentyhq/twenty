import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class DropLogicFunctionLayerIdFromLogicFunction1770050300000
  implements MigrationInterface
{
  name = 'DropLogicFunctionLayerIdFromLogicFunction1770050300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT IF EXISTS "FK_87e3f7b8f23cd90709e127f60c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT IF EXISTS "FK_4b9625a4babf7f4fa942fd26514"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_LOGIC_FUNCTION_LAYER_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP COLUMN IF EXISTS "logicFunctionLayerId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD "logicFunctionLayerId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_LOGIC_FUNCTION_LAYER_ID" ON "core"."logicFunction" ("logicFunctionLayerId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD CONSTRAINT "FK_4b9625a4babf7f4fa942fd26514" FOREIGN KEY ("logicFunctionLayerId") REFERENCES "core"."logicFunctionLayer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
