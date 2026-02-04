import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class MakeLogicFunctionLayerIdNullable1770050200000
  implements MigrationInterface
{
  name = 'MakeLogicFunctionLayerIdNullable1770050200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ALTER COLUMN "logicFunctionLayerId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ALTER COLUMN "logicFunctionLayerId" SET NOT NULL`,
    );
  }
}
