import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RefactorAgentChatEntities1764100000000
  implements MigrationInterface
{
  name = 'RefactorAgentChatEntities1764100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old tables and their constraints (data loss acceptable)
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."agentChatMessagePart" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."agentChatMessage" CASCADE`,
    );

    // Create agentTurn table
    await queryRunner.query(
      `CREATE TABLE "core"."agentTurn" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "threadId" uuid NOT NULL, "agentId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0e3f599ba7cf6a02fc940d9f18d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3be906dca9d5b50fbfe40e33f0" ON "core"."agentTurn" ("threadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e6d7c07f32e6f0f08cf639d4f5" ON "core"."agentTurn" ("agentId") `,
    );

    // Create agentMessage enum and table
    await queryRunner.query(
      `CREATE TYPE "core"."agentMessage_role_enum" AS ENUM('user', 'assistant')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."agentMessage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "threadId" uuid NOT NULL, "turnId" uuid NOT NULL, "agentId" uuid, "role" "core"."agentMessage_role_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8c2e7b0c3c9e1b7a9e5e3f4d5c6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c31daa882e3130534995bf90c" ON "core"."agentMessage" ("threadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87dbab10ac94d9a091f8efaa67" ON "core"."agentMessage" ("turnId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_48c75cb32ff0d2887ef0dc547f" ON "core"."agentMessage" ("agentId") `,
    );

    // Create agentMessagePart table
    await queryRunner.query(
      `CREATE TABLE "core"."agentMessagePart" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "messageId" uuid NOT NULL, "orderIndex" integer NOT NULL, "type" character varying NOT NULL, "textContent" text, "reasoningContent" text, "toolName" character varying, "toolCallId" character varying, "toolInput" jsonb, "toolOutput" jsonb, "state" character varying, "errorMessage" text, "errorDetails" jsonb, "sourceUrlSourceId" character varying, "sourceUrlUrl" character varying, "sourceUrlTitle" character varying, "sourceDocumentSourceId" character varying, "sourceDocumentMediaType" character varying, "sourceDocumentTitle" character varying, "sourceDocumentFilename" character varying, "fileMediaType" character varying, "fileFilename" character varying, "fileUrl" character varying, "providerMetadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e8c9f0b1a2b3c4d5e6f7a8b9c0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2aff9daad5cc3b5e15ca717334" ON "core"."agentMessagePart" ("messageId") `,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "core"."agentTurn" ADD CONSTRAINT "FK_3be906dca9d5b50fbfe40e33f07" FOREIGN KEY ("threadId") REFERENCES "core"."agentChatThread"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" ADD CONSTRAINT "FK_4c31daa882e3130534995bf90ca" FOREIGN KEY ("threadId") REFERENCES "core"."agentChatThread"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" ADD CONSTRAINT "FK_87dbab10ac94d9a091f8efaa67b" FOREIGN KEY ("turnId") REFERENCES "core"."agentTurn"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessagePart" ADD CONSTRAINT "FK_2aff9daad5cc3b5e15ca7173342" FOREIGN KEY ("messageId") REFERENCES "core"."agentMessage"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessagePart" DROP CONSTRAINT "FK_2aff9daad5cc3b5e15ca7173342"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" DROP CONSTRAINT "FK_87dbab10ac94d9a091f8efaa67b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" DROP CONSTRAINT "FK_4c31daa882e3130534995bf90ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentTurn" DROP CONSTRAINT "FK_3be906dca9d5b50fbfe40e33f07"`,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "core"."IDX_2aff9daad5cc3b5e15ca717334"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_48c75cb32ff0d2887ef0dc547f"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_87dbab10ac94d9a091f8efaa67"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_4c31daa882e3130534995bf90c"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e6d7c07f32e6f0f08cf639d4f5"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3be906dca9d5b50fbfe40e33f0"`,
    );

    // Drop new tables
    await queryRunner.query(`DROP TABLE "core"."agentMessagePart"`);
    await queryRunner.query(`DROP TABLE "core"."agentMessage"`);
    await queryRunner.query(`DROP TYPE "core"."agentMessage_role_enum"`);
    await queryRunner.query(`DROP TABLE "core"."agentTurn"`);

    // Recreate old tables with enum
    await queryRunner.query(
      `CREATE TYPE "core"."agentChatMessage_role_enum" AS ENUM('user', 'assistant')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."agentChatMessage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "threadId" uuid NOT NULL, "agentId" uuid, "role" "core"."agentChatMessage_role_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f54a95b34e98d94251bce37a180" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd5b23d4e471b630137b3017ba" ON "core"."agentChatMessage" ("threadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f3cab3cd2160867060a2812a3d" ON "core"."agentChatMessage" ("agentId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."agentChatMessagePart" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "messageId" uuid NOT NULL, "orderIndex" integer NOT NULL, "type" character varying NOT NULL, "textContent" text, "reasoningContent" text, "toolName" character varying, "toolCallId" character varying, "toolInput" jsonb, "toolOutput" jsonb, "state" character varying, "errorMessage" text, "errorDetails" jsonb, "sourceUrlSourceId" character varying, "sourceUrlUrl" character varying, "sourceUrlTitle" character varying, "sourceDocumentSourceId" character varying, "sourceDocumentMediaType" character varying, "sourceDocumentTitle" character varying, "sourceDocumentFilename" character varying, "fileMediaType" character varying, "fileFilename" character varying, "fileUrl" character varying, "providerMetadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c28499bb0699730d41e57e1fe23" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5d4b48eeebfa7b23cd2226a874" ON "core"."agentChatMessagePart" ("messageId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" ADD CONSTRAINT "FK_cd5b23d4e471b630137b3017ba6" FOREIGN KEY ("threadId") REFERENCES "core"."agentChatThread"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessagePart" ADD CONSTRAINT "FK_5d4b48eeebfa7b23cd2226a874f" FOREIGN KEY ("messageId") REFERENCES "core"."agentChatMessage"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
