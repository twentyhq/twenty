import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUseRecommendedModels1771840510112
  implements MigrationInterface
{
  name = 'AddUseRecommendedModels1771840510112';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "useRecommendedModels" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "useRecommendedModels"`,
    );
  }
}
