import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAgentChatMessageAndThreadTable1751467467020
  implements MigrationInterface
{
  name = 'AddAgentChatMessageAndThreadTable1751467467020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."agentChatMessage_role_enum" AS ENUM('user', 'assistant')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."agentChatMessage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "threadId" uuid NOT NULL, "role" "core"."agentChatMessage_role_enum" NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f54a95b34e98d94251bce37a180" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd5b23d4e471b630137b3017ba" ON "core"."agentChatMessage" ("threadId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."agentChatThread" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "agentId" uuid NOT NULL, "userWorkspaceId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a53b1d75d11ec67d13590cfa627" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0bdc80c68a48b1f26727aabfe" ON "core"."agentChatThread" ("agentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3bd935d6f8c5ce87194b8db824" ON "core"."agentChatThread" ("userWorkspaceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" ADD CONSTRAINT "FK_cd5b23d4e471b630137b3017ba6" FOREIGN KEY ("threadId") REFERENCES "core"."agentChatThread"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD CONSTRAINT "FK_d0bdc80c68a48b1f26727aabfe6" FOREIGN KEY ("agentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD CONSTRAINT "FK_3bd935d6f8c5ce87194b8db8240" FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP CONSTRAINT "FK_3bd935d6f8c5ce87194b8db8240"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP CONSTRAINT "FK_d0bdc80c68a48b1f26727aabfe6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" DROP CONSTRAINT "FK_cd5b23d4e471b630137b3017ba6"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agentChatThread"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_cd5b23d4e471b630137b3017ba"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_d0bdc80c68a48b1f26727aabfe"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3bd935d6f8c5ce87194b8db824"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agentChatMessage"`);
    await queryRunner.query(`DROP TYPE "core"."agentChatMessage_role_enum"`);
  }
}
