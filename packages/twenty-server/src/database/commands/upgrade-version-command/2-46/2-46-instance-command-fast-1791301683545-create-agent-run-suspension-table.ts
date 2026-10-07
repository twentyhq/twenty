import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.46.0', 1791301683545)
export class CreateAgentRunSuspensionTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."agentRunSuspension" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "threadId" uuid NOT NULL, "caller" jsonb NOT NULL, "runSpec" jsonb, "summary" jsonb, "resumeCount" integer NOT NULL DEFAULT \'0\', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_AGENT_RUN_SUSPENSION_THREAD_ID" UNIQUE ("threadId"), CONSTRAINT "PK_ffa8fcfd24c5a8e0122f5a682af" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "core"."agentRunSuspension" ADD CONSTRAINT "FK_3005d9ef8e9f321e387a8ac0b6a" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."agentRunSuspension" DROP CONSTRAINT "FK_3005d9ef8e9f321e387a8ac0b6a"');
    await queryRunner.query('DROP TABLE "core"."agentRunSuspension"');
  }
}
