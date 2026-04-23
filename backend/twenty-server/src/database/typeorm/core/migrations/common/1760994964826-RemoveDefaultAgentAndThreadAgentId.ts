import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveDefaultAgentAndThreadAgentId1760994964826
  implements MigrationInterface
{
  name = 'RemoveDefaultAgentAndThreadAgentId1760994964826';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP CONSTRAINT "FK_d0bdc80c68a48b1f26727aabfe6"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_d0bdc80c68a48b1f26727aabfe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "defaultAgentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "agentId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD "agentId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "defaultAgentId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0bdc80c68a48b1f26727aabfe" ON "core"."agentChatThread" ("agentId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD CONSTRAINT "FK_d0bdc80c68a48b1f26727aabfe6" FOREIGN KEY ("agentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
