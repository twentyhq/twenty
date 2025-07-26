import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTitleToAgentChatThread1752543000368
  implements MigrationInterface
{
  name = 'AddTitleToAgentChatThread1752543000368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD "title" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "title"`,
    );
  }
}
