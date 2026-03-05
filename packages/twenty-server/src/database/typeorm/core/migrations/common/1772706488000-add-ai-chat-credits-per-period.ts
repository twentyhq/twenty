import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddAiChatCreditsPerPeriod1772706488000
  implements MigrationInterface
{
  name = 'AddAiChatCreditsPerPeriod1772706488000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "maxAiChatCreditsPerPeriod" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "defaultUserAiChatMaxCreditsPerPeriod" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "defaultUserAiChatMaxCreditsPerPeriod"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "maxAiChatCreditsPerPeriod"`,
    );
  }
}
