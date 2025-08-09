import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAiAgentConfigTable1749321615327 implements MigrationInterface {
  name = 'CreateAiAgentConfigTable1749321615327';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum type first
    await queryRunner.query(
      `CREATE TYPE "core"."aiAgentConfig_status_enum" AS ENUM('ENABLED', 'DISABLED')`,
    );

    // Create the aiAgentConfig table
    await queryRunner.query(
      `CREATE TABLE "core"."aiAgentConfig" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "objectMetadataId" uuid,
        "viewId" uuid,
        "fieldMetadataId" uuid,
        "viewGroupId" uuid,
        "agent" text NOT NULL,
        "wipLimit" integer NOT NULL DEFAULT 3,
        "additionalInput" character varying(5000),
        "status" "core"."aiAgentConfig_status_enum" NOT NULL DEFAULT 'ENABLED',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_aiAgentConfig" PRIMARY KEY ("id")
      )`,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "core"."aiAgentConfig" ADD CONSTRAINT "FK_aiAgentConfig_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Add indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_aiAgentConfig_workspaceId" ON "core"."aiAgentConfig" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aiAgentConfig_deletedAt" ON "core"."aiAgentConfig" ("deletedAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aiAgentConfig_status" ON "core"."aiAgentConfig" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "core"."IDX_aiAgentConfig_status"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_aiAgentConfig_deletedAt"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_aiAgentConfig_workspaceId"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "core"."aiAgentConfig" DROP CONSTRAINT "FK_aiAgentConfig_workspaceId"`,
    );

    // Drop the table
    await queryRunner.query(`DROP TABLE "core"."aiAgentConfig"`);

    // Drop the enum type
    await queryRunner.query(`DROP TYPE "core"."aiAgentConfig_status_enum"`);
  }
} 