import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRoleTargetsUniqueConstraint1764329720503 implements MigrationInterface {
    name = 'UpdateRoleTargetsUniqueConstraint1764329720503'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE"`);
        await queryRunner.query(`ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE_API_KEY" UNIQUE ("workspaceId", "apiKeyId")`);
        await queryRunner.query(`ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE_AGENT" UNIQUE ("workspaceId", "agentId")`);
        await queryRunner.query(`ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE_USER_WORKSPACE" UNIQUE ("workspaceId", "userWorkspaceId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE_USER_WORKSPACE"`);
        await queryRunner.query(`ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE_AGENT"`);
        await queryRunner.query(`ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE_API_KEY"`);
        await queryRunner.query(`ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE" UNIQUE ("workspaceId", "userWorkspaceId", "agentId", "apiKeyId")`);
    }

}
