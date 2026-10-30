import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.44.0', 1793351365262)
export class AddSetuAiActionTablesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."setuAiActionRequest" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspaceId" uuid NOT NULL, "threadId" uuid, "taskId" uuid, "initiatorUserWorkspaceId" uuid NOT NULL, "logicalActionId" uuid NOT NULL, "revision" integer NOT NULL, "kind" character varying NOT NULL, "payload" jsonb NOT NULL, "payloadHash" character varying NOT NULL, "preconditions" jsonb NOT NULL DEFAULT \'{}\', "status" character varying NOT NULL, "stateVersion" integer NOT NULL DEFAULT \'1\', "deduplicationKey" character varying NOT NULL, "policyVersion" integer NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE, "decidedByUserWorkspaceId" uuid, "decidedAt" TIMESTAMP WITH TIME ZONE, "decisionRequestId" character varying, "leaseOwner" character varying, "leaseExpiresAt" TIMESTAMP WITH TIME ZONE, "fencingToken" integer NOT NULL DEFAULT \'0\', "errorCode" character varying, "receipt" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bcd1ebf746d4416360c1885653a" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_SETU_AI_ACTION_REQUEST_THREAD" ON "core"."setuAiActionRequest" ("workspaceId", "threadId") ');
    await queryRunner.query('CREATE INDEX "IDX_SETU_AI_ACTION_REQUEST_STATUS" ON "core"."setuAiActionRequest" ("status", "leaseExpiresAt") ');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_SETU_AI_ACTION_REQUEST_ONE_OPEN_REVISION" ON "core"."setuAiActionRequest" ("logicalActionId") WHERE "status" IN (\'pending_review\', \'queued\', \'running\', \'delivery_unknown\')');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_SETU_AI_ACTION_REQUEST_LOGICAL_REVISION" ON "core"."setuAiActionRequest" ("logicalActionId", "revision") ');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_SETU_AI_ACTION_REQUEST_DEDUPLICATION_KEY" ON "core"."setuAiActionRequest" ("workspaceId", "deduplicationKey") ');
    await queryRunner.query('CREATE TABLE "core"."setuAiActionAttempt" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspaceId" uuid NOT NULL, "actionRequestId" uuid NOT NULL, "attemptNumber" integer NOT NULL, "fencingToken" integer NOT NULL, "outcome" character varying NOT NULL, "errorCode" character varying, "providerCorrelationId" character varying, "sanitizedResult" jsonb, "finishedAt" TIMESTAMP WITH TIME ZONE, "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_640accf3b7d813ffb05fb6fd010" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_SETU_AI_ACTION_ATTEMPT_ACTION_NUMBER" ON "core"."setuAiActionAttempt" ("actionRequestId", "attemptNumber") ');
    await queryRunner.query('ALTER TABLE "core"."setuAiActionRequest" ADD CONSTRAINT "FK_cabef15e87800d0d1afbb129a97" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."setuAiActionAttempt" ADD CONSTRAINT "FK_6be6d64b578cfb51b70bf4befe9" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."setuAiActionAttempt" ADD CONSTRAINT "FK_d7ee4ebedc8fbc6b68ce97df0ba" FOREIGN KEY ("actionRequestId") REFERENCES "core"."setuAiActionRequest"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."setuAiActionAttempt" DROP CONSTRAINT "FK_d7ee4ebedc8fbc6b68ce97df0ba"');
    await queryRunner.query('ALTER TABLE "core"."setuAiActionAttempt" DROP CONSTRAINT "FK_6be6d64b578cfb51b70bf4befe9"');
    await queryRunner.query('ALTER TABLE "core"."setuAiActionRequest" DROP CONSTRAINT "FK_cabef15e87800d0d1afbb129a97"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETU_AI_ACTION_ATTEMPT_ACTION_NUMBER"');
    await queryRunner.query('DROP TABLE "core"."setuAiActionAttempt"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETU_AI_ACTION_REQUEST_DEDUPLICATION_KEY"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETU_AI_ACTION_REQUEST_LOGICAL_REVISION"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETU_AI_ACTION_REQUEST_ONE_OPEN_REVISION"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETU_AI_ACTION_REQUEST_STATUS"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETU_AI_ACTION_REQUEST_THREAD"');
    await queryRunner.query('DROP TABLE "core"."setuAiActionRequest"');
  }
}
