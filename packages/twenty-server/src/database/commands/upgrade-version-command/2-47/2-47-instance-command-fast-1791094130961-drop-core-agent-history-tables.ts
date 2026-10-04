import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// History moved to workspace storage in 2.42; every command that still reads
// these tables belongs to an earlier version, so it has run by now
@RegisteredInstanceCommand('2.47.0', 1791094130961)
export class DropCoreAgentHistoryTablesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."agentTurnEvaluation", "core"."agentMessagePart", "core"."agentMessage", "core"."agentTurn", "core"."agentChatThread"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."agentMessage_role_enum", "core"."agentMessage_status_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."agentMessage_role_enum" AS ENUM ('user', 'assistant', 'system'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."agentMessage_status_enum" AS ENUM ('queued', 'sent'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."agentChatThread" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userWorkspaceId" uuid NOT NULL,
        "title" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "totalInputTokens" integer NOT NULL DEFAULT 0,
        "totalOutputTokens" integer NOT NULL DEFAULT 0,
        "contextWindowTokens" integer,
        "totalInputCredits" bigint NOT NULL DEFAULT 0,
        "totalOutputCredits" bigint NOT NULL DEFAULT 0,
        "conversationSize" integer NOT NULL DEFAULT 0,
        "activeStreamId" character varying,
        "workspaceId" uuid NOT NULL,
        "totalCacheReadTokens" bigint NOT NULL DEFAULT 0,
        "totalCacheCreationTokens" bigint NOT NULL DEFAULT 0,
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "lastStreamError" jsonb,
        "pendingQuestionMessageId" uuid,
        CONSTRAINT "PK_82f67c93227868769e9553f059e" PRIMARY KEY ("id"),
        CONSTRAINT "FK_3bd935d6f8c5ce87194b8db8240" FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_3d097ed53841d80904ed02c8373" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."agentTurn" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "threadId" uuid NOT NULL,
        "agentId" uuid,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "workspaceId" uuid NOT NULL,
        CONSTRAINT "PK_0e3f599ba7cf6a02fc940d9f18d" PRIMARY KEY ("id"),
        CONSTRAINT "FK_3be906dca9d5b50fbfe40e33f07" FOREIGN KEY ("threadId") REFERENCES "core"."agentChatThread"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_a4bb3c6176c2607693a6756ff6c" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."agentMessage" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "threadId" uuid NOT NULL,
        "turnId" uuid,
        "agentId" uuid,
        "role" "core"."agentMessage_role_enum" NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "status" "core"."agentMessage_status_enum" NOT NULL DEFAULT 'sent',
        "processedAt" TIMESTAMP WITH TIME ZONE,
        "workspaceId" uuid NOT NULL,
        "isHidden" boolean NOT NULL DEFAULT false,
        "senderUserWorkspaceId" uuid,
        "senderApplicationId" uuid,
        CONSTRAINT "PK_8c2e7b0c3c9e1b7a9e5e3f4d5c6" PRIMARY KEY ("id"),
        CONSTRAINT "FK_4c31daa882e3130534995bf90ca" FOREIGN KEY ("threadId") REFERENCES "core"."agentChatThread"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_87dbab10ac94d9a091f8efaa67b" FOREIGN KEY ("turnId") REFERENCES "core"."agentTurn"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_75db4f2e80922078e8171ae130a" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."agentMessagePart" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "messageId" uuid NOT NULL,
        "orderIndex" integer NOT NULL,
        "type" character varying NOT NULL,
        "textContent" text,
        "reasoningContent" text,
        "toolName" character varying,
        "toolCallId" character varying,
        "toolInput" jsonb,
        "toolOutput" jsonb,
        "state" character varying,
        "errorMessage" text,
        "errorDetails" jsonb,
        "sourceUrlSourceId" character varying,
        "sourceUrlUrl" character varying,
        "sourceUrlTitle" character varying,
        "sourceDocumentSourceId" character varying,
        "sourceDocumentMediaType" character varying,
        "sourceDocumentTitle" character varying,
        "sourceDocumentFilename" character varying,
        "fileFilename" character varying,
        "providerMetadata" jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "fileId" uuid,
        "workspaceId" uuid NOT NULL,
        "providerExecuted" boolean,
        CONSTRAINT "PK_7e8c9f0b1a2b3c4d5e6f7a8b9c0" PRIMARY KEY ("id"),
        CONSTRAINT "FK_2aff9daad5cc3b5e15ca7173342" FOREIGN KEY ("messageId") REFERENCES "core"."agentMessage"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_f3865544cee5742b5f5dd7340ef" FOREIGN KEY ("fileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_70b398dc45219db8f3e36b3a078" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."agentTurnEvaluation" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "turnId" uuid NOT NULL,
        "score" integer NOT NULL,
        "comment" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "workspaceId" uuid NOT NULL,
        CONSTRAINT "PK_agentTurnEvaluation" PRIMARY KEY ("id"),
        CONSTRAINT "FK_c94f072dbd3c11f7df51db52934" FOREIGN KEY ("turnId") REFERENCES "core"."agentTurn"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_c81d8fabdda94b7fa86fb6f1e70" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_3bd935d6f8c5ce87194b8db824" ON "core"."agentChatThread" ("userWorkspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_3d097ed53841d80904ed02c837" ON "core"."agentChatThread" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_THREAD_ID_DELETED_AT" ON "core"."agentChatThread" ("id", "deletedAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_3be906dca9d5b50fbfe40e33f0" ON "core"."agentTurn" ("threadId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_a4bb3c6176c2607693a6756ff6" ON "core"."agentTurn" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_e6d7c07f32e6f0f08cf639d4f5" ON "core"."agentTurn" ("agentId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_4c31daa882e3130534995bf90c" ON "core"."agentMessage" ("threadId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_87dbab10ac94d9a091f8efaa67" ON "core"."agentMessage" ("turnId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_48c75cb32ff0d2887ef0dc547f" ON "core"."agentMessage" ("agentId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_75db4f2e80922078e8171ae130" ON "core"."agentMessage" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_2aff9daad5cc3b5e15ca717334" ON "core"."agentMessagePart" ("messageId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_70b398dc45219db8f3e36b3a07" ON "core"."agentMessagePart" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_c94f072dbd3c11f7df51db5293" ON "core"."agentTurnEvaluation" ("turnId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_c81d8fabdda94b7fa86fb6f1e7" ON "core"."agentTurnEvaluation" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_AGENT_MESSAGE_THREAD_ID_IS_HIDDEN_UNIQUE" ON "core"."agentMessage" ("threadId") WHERE "isHidden" = true`,
    );
  }
}
