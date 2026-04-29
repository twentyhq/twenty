import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveStreamIdToAgentChatThread1774003611071
  implements MigrationInterface
{
  name = 'AddActiveStreamIdToAgentChatThread1774003611071';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD "activeStreamId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "activeStreamId"`,
    );
  }
}
