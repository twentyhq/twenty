import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddWorkspaceTrashRetention1759182953990
  implements MigrationInterface
{
  name = 'AddWorkspaceTrashRetention1759182953990';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "trashRetentionDays" integer NOT NULL DEFAULT '14'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "nextTrashCleanupAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '14 days'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_WORKSPACE_NEXT_TRASH_CLEANUP_AT" ON "core"."workspace" ("nextTrashCleanupAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "trash_retention_positive" CHECK ("trashRetentionDays" >= 0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "trash_retention_positive"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_WORKSPACE_NEXT_TRASH_CLEANUP_AT"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "nextTrashCleanupAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "trashRetentionDays"`,
    );
  }
}
