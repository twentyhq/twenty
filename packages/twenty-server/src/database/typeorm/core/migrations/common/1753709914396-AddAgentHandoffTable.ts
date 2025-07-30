import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAgentHandoffTable1753709914396 implements MigrationInterface {
  name = 'AddAgentHandoffTable1753709914396';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."agentHandoff" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fromAgentId" uuid NOT NULL, "toAgentId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "description" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_44aad35fb18ea2696f242d3fd76" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_AGENT_HANDOFF_FROM_TO_WORKSPACE_UNIQUE" ON "core"."agentHandoff" ("fromAgentId", "toAgentId", "workspaceId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AGENT_HANDOFF_ID_DELETED_AT" ON "core"."agentHandoff" ("id", "deletedAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentHandoff" ADD CONSTRAINT "FK_d22cdf705b1302c8fa423e73dc1" FOREIGN KEY ("fromAgentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentHandoff" ADD CONSTRAINT "FK_a1aa45815aa37507f986e971996" FOREIGN KEY ("toAgentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentHandoff" ADD CONSTRAINT "FK_fe6aae82838e18de7d411b81018" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentHandoff" DROP CONSTRAINT "FK_fe6aae82838e18de7d411b81018"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentHandoff" DROP CONSTRAINT "FK_a1aa45815aa37507f986e971996"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentHandoff" DROP CONSTRAINT "FK_d22cdf705b1302c8fa423e73dc1"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_AGENT_HANDOFF_ID_DELETED_AT"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_AGENT_HANDOFF_FROM_TO_WORKSPACE_UNIQUE"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agentHandoff"`);
  }
}
