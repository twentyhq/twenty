import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveAgentHandoffTable1763805513241
  implements MigrationInterface
{
  name = 'RemoveAgentHandoffTable1763805513241';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."agentHandoff" CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "responseFormat" SET DEFAULT '{"type":"text"}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "responseFormat" DROP DEFAULT`,
    );
    await queryRunner.query(`CREATE TABLE "core"."agentHandoff" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "fromAgentId" uuid NOT NULL,
            "toAgentId" uuid NOT NULL,
            "workspaceId" uuid NOT NULL,
            "description" text,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deletedAt" TIMESTAMP WITH TIME ZONE,
            CONSTRAINT "PK_agentHandoff" PRIMARY KEY ("id"),
            CONSTRAINT "FK_agentHandoff_fromAgent" FOREIGN KEY ("fromAgentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_agentHandoff_toAgent" FOREIGN KEY ("toAgentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_agentHandoff_workspace" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
        )`);
  }
}
