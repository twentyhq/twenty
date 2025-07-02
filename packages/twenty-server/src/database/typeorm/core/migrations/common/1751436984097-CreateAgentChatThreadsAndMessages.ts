import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAgentChatThreadsAndMessages1751436984097
  implements MigrationInterface
{
  name = 'CreateAgentChatThreadsAndMessages1751436984097';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."agent_chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "threadId" uuid NOT NULL, "sender" character varying(8) NOT NULL, "message" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_027f23a2ff50cee948fe26e4dc2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_98220335d760255ae5f4c819cf" ON "core"."agent_chat_messages" ("threadId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."agent_chat_threads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "agentId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a76547b5dcd14f7525373383883" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_835cfc934d46c0fc3efb6d1d82" ON "core"."agent_chat_threads" ("agentId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent_chat_messages" ADD CONSTRAINT "FK_98220335d760255ae5f4c819cf0" FOREIGN KEY ("threadId") REFERENCES "core"."agent_chat_threads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent_chat_threads" ADD CONSTRAINT "FK_835cfc934d46c0fc3efb6d1d82a" FOREIGN KEY ("agentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent_chat_threads" DROP CONSTRAINT "FK_835cfc934d46c0fc3efb6d1d82a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent_chat_messages" DROP CONSTRAINT "FK_98220335d760255ae5f4c819cf0"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_835cfc934d46c0fc3efb6d1d82"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agent_chat_threads"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_98220335d760255ae5f4c819cf"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agent_chat_messages"`);
  }
}
