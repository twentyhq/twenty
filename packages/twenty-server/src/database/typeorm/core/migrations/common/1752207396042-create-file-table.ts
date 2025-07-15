import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileTable1752207396042 implements MigrationInterface {
  name = 'CreateFileTable1752207396042';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "fullPath" character varying NOT NULL, "size" bigint NOT NULL, "type" character varying NOT NULL, "workspaceId" uuid NOT NULL, "messageId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FILE_WORKSPACE_ID" ON "core"."file" ("workspaceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD CONSTRAINT "FK_de468b3d8dcf7e94f7074220929" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD CONSTRAINT "FK_a78a68c3f577a485dd4c741909f" FOREIGN KEY ("messageId") REFERENCES "core"."agentChatMessage"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP CONSTRAINT "FK_a78a68c3f577a485dd4c741909f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP CONSTRAINT "FK_de468b3d8dcf7e94f7074220929"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_FILE_WORKSPACE_ID"`);
    await queryRunner.query(`DROP TABLE "core"."file"`);
  }
}
