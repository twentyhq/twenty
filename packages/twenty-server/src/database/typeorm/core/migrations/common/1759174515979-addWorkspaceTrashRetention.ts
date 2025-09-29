import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkspaceTrashRetention1759174515979 implements MigrationInterface {
    name = 'AddWorkspaceTrashRetention1759174515979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD "trashRetentionDays" integer NOT NULL DEFAULT '14'`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD "nextTrashCleanupAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '14 days'`);
        await queryRunner.query(`CREATE INDEX "IDX_WORKSPACE_NEXT_TRASH_CLEANUP_AT" ON "core"."workspace" ("nextTrashCleanupAt") `);

        // Backfill existing workspaces with staggered cleanup times to prevent thundering herd
        // Spreads cleanup across 24 hours using random distribution
        await queryRunner.query(`UPDATE "core"."workspace" SET "nextTrashCleanupAt" = NOW() + (RANDOM() * INTERVAL '24 hours') WHERE "nextTrashCleanupAt" = NOW() + INTERVAL '14 days'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "core"."IDX_WORKSPACE_NEXT_TRASH_CLEANUP_AT"`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP COLUMN "nextTrashCleanupAt"`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP COLUMN "trashRetentionDays"`);
    }

}
