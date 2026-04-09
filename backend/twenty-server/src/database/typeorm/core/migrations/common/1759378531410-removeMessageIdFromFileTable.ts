import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveMessageIdFromFileTable1759378531410
  implements MigrationInterface
{
  name = 'RemoveMessageIdFromFileTable1759378531410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP CONSTRAINT "FK_a78a68c3f577a485dd4c741909f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP COLUMN "messageId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."file" ADD "messageId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD CONSTRAINT "FK_a78a68c3f577a485dd4c741909f" FOREIGN KEY ("messageId") REFERENCES "core"."agentChatMessage"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
