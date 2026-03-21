import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddFastAndSmartModelsToWorkspace1763997530458
  implements MigrationInterface
{
  name = 'AddFastAndSmartModelsToWorkspace1763997530458';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "fastModel" character varying NOT NULL DEFAULT 'default-fast-model'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "smartModel" character varying NOT NULL DEFAULT 'default-smart-model'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "smartModel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "fastModel"`,
    );
  }
}
