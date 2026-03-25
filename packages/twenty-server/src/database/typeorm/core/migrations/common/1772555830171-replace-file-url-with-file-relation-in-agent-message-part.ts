import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class ReplaceFileUrlWithFileRelationInAgentMessagePart1772555830171
  implements MigrationInterface
{
  name = 'ReplaceFileUrlWithFileRelationInAgentMessagePart1772555830171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessagePart" DROP COLUMN "fileUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessagePart" DROP COLUMN "fileMediaType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessagePart" ADD "fileId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessagePart" ADD CONSTRAINT "FK_f3865544cee5742b5f5dd7340ef" FOREIGN KEY ("fileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessagePart" DROP CONSTRAINT "FK_f3865544cee5742b5f5dd7340ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessagePart" DROP COLUMN "fileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessagePart" ADD "fileMediaType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessagePart" ADD "fileUrl" character varying`,
    );
  }
}
