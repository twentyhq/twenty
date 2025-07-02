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
      `CREATE TABLE "core"."agentChatThreads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "agentId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a53b1d75d11ec67d13590cfa627" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9c716045fa8012bc198108b203" ON "core"."agentChatThreads" ("agentId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" ADD CONSTRAINT "FK_cd5b23d4e471b630137b3017ba6" FOREIGN KEY ("threadId") REFERENCES "core"."agentChatThreads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreads" ADD CONSTRAINT "FK_9c716045fa8012bc198108b2035" FOREIGN KEY ("agentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreads" DROP CONSTRAINT "FK_9c716045fa8012bc198108b2035"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" DROP CONSTRAINT "FK_cd5b23d4e471b630137b3017ba6"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_9c716045fa8012bc198108b203"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agentChatThreads"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_cd5b23d4e471b630137b3017ba"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agentChatMessage"`);
    await queryRunner.query(`DROP TYPE "core"."agentChatMessage_role_enum"`);
  }
}
