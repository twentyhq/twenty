import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApikeyIdToRoleTargets1753089620981
  implements MigrationInterface
{
  name = 'AddApikeyIdToRoleTargets1753089620981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "CHK_role_targets_either_agent_or_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD "apiKeyId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ROLE_TARGETS_API_KEY_ID" ON "core"."roleTargets" ("apiKeyId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "CHK_role_targets_single_entity" CHECK (("agentId" IS NOT NULL AND "userWorkspaceId" IS NULL AND "apiKeyId" IS NULL) OR ("agentId" IS NULL AND "userWorkspaceId" IS NOT NULL AND "apiKeyId" IS NULL) OR ("agentId" IS NULL AND "userWorkspaceId" IS NULL AND "apiKeyId" IS NOT NULL))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "FK_915c8bcb0f861a56f793a4b8331" FOREIGN KEY ("apiKeyId") REFERENCES "core"."apiKey"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "FK_915c8bcb0f861a56f793a4b8331"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "CHK_role_targets_single_entity"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_ROLE_TARGETS_API_KEY_ID"`);
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP COLUMN "apiKeyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "CHK_role_targets_either_agent_or_user" CHECK (((("agentId" IS NOT NULL) AND ("userWorkspaceId" IS NULL)) OR (("agentId" IS NULL) AND ("userWorkspaceId" IS NOT NULL))))`,
    );
  }
}
