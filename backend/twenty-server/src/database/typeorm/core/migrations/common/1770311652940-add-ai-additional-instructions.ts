import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddAiAdditionalInstructions1770311652940
  implements MigrationInterface
{
  name = 'AddAiAdditionalInstructions1770311652940';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "aiAdditionalInstructions" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "aiAdditionalInstructions"`,
    );
  }
}
