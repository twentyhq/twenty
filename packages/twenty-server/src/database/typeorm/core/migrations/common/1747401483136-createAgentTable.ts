import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAgentTable1747401483136 implements MigrationInterface {
  name = 'CreateAgentTable1747401483136';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."agent" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "prompt" text NOT NULL,
        "model" character varying NOT NULL,
        "responseFormat" text NOT NULL,
        "workspaceId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_agent" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AGENT_ID_DELETED_AT" ON "core"."agent" ("id", "deletedAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "core"."IDX_AGENT_ID_DELETED_AT"`);
    await queryRunner.query(`DROP TABLE "core"."agent"`);
  }
}
