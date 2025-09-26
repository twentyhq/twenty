import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class NameOfYourMigration1758767315179 implements MigrationInterface {
  name = 'CreateAgentChatMessagePartTableAndRemoveRawContent1758767315179';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."agentChatMessagePart" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "messageId" uuid NOT NULL, "orderIndex" integer NOT NULL, "type" character varying(50) NOT NULL, "textContent" text, "reasoningContent" text, "toolName" character varying(100), "toolCallId" character varying(50), "toolInput" jsonb, "toolOutput" jsonb, "state" character varying(50), "errorMessage" text, "errorDetails" jsonb, "sourceUrlSourceId" character varying(100), "sourceUrlUrl" character varying(500), "sourceUrlTitle" character varying(200), "sourceDocumentSourceId" character varying(100), "sourceDocumentMediaType" character varying(100), "sourceDocumentTitle" character varying(200), "sourceDocumentFilename" character varying(255), "fileMediaType" character varying(100), "fileFilename" character varying(255), "fileUrl" character varying(500), "providerMetadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c28499bb0699730d41e57e1fe23" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5d4b48eeebfa7b23cd2226a874" ON "core"."agentChatMessagePart" ("messageId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" DROP COLUMN "rawContent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessagePart" ADD CONSTRAINT "FK_5d4b48eeebfa7b23cd2226a874f" FOREIGN KEY ("messageId") REFERENCES "core"."agentChatMessage"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessagePart" DROP CONSTRAINT "FK_5d4b48eeebfa7b23cd2226a874f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" ADD "rawContent" text`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_5d4b48eeebfa7b23cd2226a874"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agentChatMessagePart"`);
  }
}
