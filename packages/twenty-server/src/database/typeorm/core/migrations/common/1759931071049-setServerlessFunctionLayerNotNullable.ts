import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class SetServerlessFunctionLayerNotNullable1759931071049
  implements MigrationInterface
{
  name = 'SetServerlessFunctionLayerNotNullable1759931071049';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "layerVersion"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "latestVersionInputSchema"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction"
        ADD "latestVersionInputSchema" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction"
        ADD "layerVersion" integer`,
    );
  }
}
