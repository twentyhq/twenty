import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteIndexes1748844710107 implements MigrationInterface {
    name = 'AddSoftDeleteIndexes1748844710107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_USER_WORKSPACE_WORKSPACE_ID" ON "core"."userWorkspace" ("workspaceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_USER_WORKSPACE_USER_ID" ON "core"."userWorkspace" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_USER_WORKSPACE_ID_DELETED_AT" ON "core"."userWorkspace" ("id", "deletedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_USER_ID_DELETED_AT" ON "core"."user" ("id", "deletedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_WORKSPACE_ID_DELETED_AT" ON "core"."workspace" ("id", "deletedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "core"."IDX_WORKSPACE_ID_DELETED_AT"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_USER_ID_DELETED_AT"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_USER_WORKSPACE_ID_DELETED_AT"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_USER_WORKSPACE_USER_ID"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_USER_WORKSPACE_WORKSPACE_ID"`);
    }

}
