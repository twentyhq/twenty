import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddEvaluationInputsToAgent1764220000000
  implements MigrationInterface
{
  name = 'AddEvaluationInputsToAgent1764220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "core"."agent"
      ADD COLUMN "evaluationInputs" text[] NOT NULL DEFAULT '{}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "core"."agent"
      DROP COLUMN "evaluationInputs"
    `);
  }
}
