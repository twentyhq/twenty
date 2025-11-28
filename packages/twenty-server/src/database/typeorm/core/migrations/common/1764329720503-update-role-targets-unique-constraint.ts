import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRoleTargetsUniqueConstraint1764329720503 implements MigrationInterface {
    name = 'UpdateRoleTargetsUniqueConstraint1764329720503'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE"`);
        await queryRunner.query(`ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE_V2" UNIQUE ("userWorkspaceId", "workspaceId", "agentId", "apiKeyId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE_V2"`);
        await queryRunner.query(`ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE" UNIQUE ("roleId", "userWorkspaceId", "agentId", "apiKeyId")`);
    }

}
