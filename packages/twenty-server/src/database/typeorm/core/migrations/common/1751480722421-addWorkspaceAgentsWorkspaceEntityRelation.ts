import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkspaceAgentsWorkspaceEntityRelation1751480722421 implements MigrationInterface {
    name = 'AddWorkspaceAgentsWorkspaceEntityRelation1751480722421'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."workspaceAgent" DROP CONSTRAINT "FK_c4cb56621768a4a325dd772bbe1"`);
        await queryRunner.query(`ALTER TABLE "core"."agentSectors" DROP CONSTRAINT "FK_1881105c19d856bd8a6584927df"`);
        await queryRunner.query(`ALTER TABLE "core"."agentInboxes" DROP CONSTRAINT "FK_026ec88fe86e63746eff660903e"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_1881105c19d856bd8a6584927d"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_026ec88fe86e63746eff660903"`);
        await queryRunner.query(`ALTER TABLE "core"."agentSectors" RENAME COLUMN "agentId" TO "workspaceAgentId"`);
        await queryRunner.query(`ALTER TABLE "core"."agentSectors" RENAME CONSTRAINT "PK_0c18c8b27732410238951935921" TO "PK_63eb08593557c3a16aaaec4ac32"`);
        await queryRunner.query(`ALTER TABLE "core"."agentInboxes" RENAME COLUMN "agentId" TO "workspaceAgentId"`);
        await queryRunner.query(`ALTER TABLE "core"."agentInboxes" RENAME CONSTRAINT "PK_5dfa966345cd5bdff1a46baa3eb" TO "PK_65e145be60457c7bb8733665b0a"`);
        await queryRunner.query(`CREATE INDEX "IDX_4c035220a377ce20f0a1a513db" ON "core"."agentSectors" ("workspaceAgentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_63c2802c2fee40641a880c3863" ON "core"."agentInboxes" ("workspaceAgentId") `);
        await queryRunner.query(`ALTER TABLE "core"."workspaceAgent" ADD CONSTRAINT "FK_5a35800996f6e8d0d4bdad661f3" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."agentSectors" ADD CONSTRAINT "FK_4c035220a377ce20f0a1a513dbc" FOREIGN KEY ("workspaceAgentId") REFERENCES "core"."workspaceAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "core"."agentInboxes" ADD CONSTRAINT "FK_63c2802c2fee40641a880c38631" FOREIGN KEY ("workspaceAgentId") REFERENCES "core"."workspaceAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."agentInboxes" DROP CONSTRAINT "FK_63c2802c2fee40641a880c38631"`);
        await queryRunner.query(`ALTER TABLE "core"."agentSectors" DROP CONSTRAINT "FK_4c035220a377ce20f0a1a513dbc"`);
        await queryRunner.query(`ALTER TABLE "core"."workspaceAgent" DROP CONSTRAINT "FK_5a35800996f6e8d0d4bdad661f3"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_63c2802c2fee40641a880c3863"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_4c035220a377ce20f0a1a513db"`);
        await queryRunner.query(`ALTER TABLE "core"."agentInboxes" RENAME CONSTRAINT "PK_65e145be60457c7bb8733665b0a" TO "PK_5dfa966345cd5bdff1a46baa3eb"`);
        await queryRunner.query(`ALTER TABLE "core"."agentInboxes" RENAME COLUMN "workspaceAgentId" TO "agentId"`);
        await queryRunner.query(`ALTER TABLE "core"."agentSectors" RENAME CONSTRAINT "PK_63eb08593557c3a16aaaec4ac32" TO "PK_0c18c8b27732410238951935921"`);
        await queryRunner.query(`ALTER TABLE "core"."agentSectors" RENAME COLUMN "workspaceAgentId" TO "agentId"`);
        await queryRunner.query(`CREATE INDEX "IDX_026ec88fe86e63746eff660903" ON "core"."agentInboxes" ("agentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1881105c19d856bd8a6584927d" ON "core"."agentSectors" ("agentId") `);
        await queryRunner.query(`ALTER TABLE "core"."agentInboxes" ADD CONSTRAINT "FK_026ec88fe86e63746eff660903e" FOREIGN KEY ("agentId") REFERENCES "core"."workspaceAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "core"."agentSectors" ADD CONSTRAINT "FK_1881105c19d856bd8a6584927df" FOREIGN KEY ("agentId") REFERENCES "core"."workspaceAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "core"."workspaceAgent" ADD CONSTRAINT "FK_c4cb56621768a4a325dd772bbe1" FOREIGN KEY ("workspaceId", "workspaceId") REFERENCES "core"."workspace"("id","id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
