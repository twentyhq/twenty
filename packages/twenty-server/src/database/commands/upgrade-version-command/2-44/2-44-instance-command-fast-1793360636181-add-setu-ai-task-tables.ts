import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.44.0', 1793360636181)
export class AddSetuAiTaskTablesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."setuAiTaskRun" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspaceId" uuid NOT NULL, "threadId" uuid, "initiatorUserWorkspaceId" uuid NOT NULL, "kind" character varying NOT NULL, "request" jsonb NOT NULL, "status" character varying NOT NULL, "stateVersion" integer NOT NULL DEFAULT \'1\', "deduplicationKey" character varying NOT NULL, "policyVersion" integer NOT NULL, "modelId" character varying NOT NULL, "tokenLimit" integer NOT NULL, "usage" jsonb NOT NULL, "errorCode" character varying, "cancelRequestId" character varying, "cancelRequestedAt" TIMESTAMP WITH TIME ZONE, "finishedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_04c0a6fe77ddc2112fc1953deb5" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_SETU_AI_TASK_RUN_STATUS" ON "core"."setuAiTaskRun" ("status") ');
    await queryRunner.query('CREATE INDEX "IDX_SETU_AI_TASK_RUN_INITIATOR_STATUS" ON "core"."setuAiTaskRun" ("workspaceId", "initiatorUserWorkspaceId", "status") ');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_SETU_AI_TASK_RUN_DEDUPLICATION_KEY" ON "core"."setuAiTaskRun" ("workspaceId", "deduplicationKey") ');
    await queryRunner.query('CREATE TABLE "core"."setuAiTaskStep" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspaceId" uuid NOT NULL, "taskId" uuid NOT NULL, "stepKey" character varying NOT NULL, "position" integer NOT NULL, "companyId" uuid NOT NULL, "companyName" character varying NOT NULL, "status" character varying NOT NULL, "stateVersion" integer NOT NULL DEFAULT \'1\', "attempts" integer NOT NULL DEFAULT \'0\', "checkpoint" jsonb NOT NULL DEFAULT \'{}\', "brief" jsonb, "pendingInput" jsonb, "lastRequestId" character varying, "errorCode" character varying, "reservedTokens" integer NOT NULL DEFAULT \'0\', "usedTokens" integer NOT NULL DEFAULT \'0\', "leaseOwner" character varying, "leaseExpiresAt" TIMESTAMP WITH TIME ZONE, "fencingToken" integer NOT NULL DEFAULT \'0\', "completedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3cd0e25fa445e41d3bc1f6a85dd" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_SETU_AI_TASK_STEP_WORKSPACE_CREATED" ON "core"."setuAiTaskStep" ("workspaceId", "createdAt") ');
    await queryRunner.query('CREATE INDEX "IDX_SETU_AI_TASK_STEP_STATUS" ON "core"."setuAiTaskStep" ("status", "leaseExpiresAt") ');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_SETU_AI_TASK_STEP_TASK_KEY" ON "core"."setuAiTaskStep" ("taskId", "stepKey") ');
    await queryRunner.query('ALTER TABLE "core"."setuAiTaskRun" ADD CONSTRAINT "FK_14634d75a0fd181f018aec80a99" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."setuAiTaskStep" ADD CONSTRAINT "FK_d816cc4b18dc867db3e29272fac" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."setuAiTaskStep" ADD CONSTRAINT "FK_c41b9f1567fd97c03c8e70a3649" FOREIGN KEY ("taskId") REFERENCES "core"."setuAiTaskRun"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."setuAiTaskStep" DROP CONSTRAINT "FK_c41b9f1567fd97c03c8e70a3649"');
    await queryRunner.query('ALTER TABLE "core"."setuAiTaskStep" DROP CONSTRAINT "FK_d816cc4b18dc867db3e29272fac"');
    await queryRunner.query('ALTER TABLE "core"."setuAiTaskRun" DROP CONSTRAINT "FK_14634d75a0fd181f018aec80a99"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETU_AI_TASK_STEP_TASK_KEY"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETU_AI_TASK_STEP_STATUS"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETU_AI_TASK_STEP_WORKSPACE_CREATED"');
    await queryRunner.query('DROP TABLE "core"."setuAiTaskStep"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETU_AI_TASK_RUN_DEDUPLICATION_KEY"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETU_AI_TASK_RUN_INITIATOR_STATUS"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETU_AI_TASK_RUN_STATUS"');
    await queryRunner.query('DROP TABLE "core"."setuAiTaskRun"');
  }
}
