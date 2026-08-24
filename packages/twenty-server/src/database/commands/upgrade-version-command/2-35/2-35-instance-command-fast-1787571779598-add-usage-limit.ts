import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.35.0', 1787571779598)
export class AddUsageLimitFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."usageLimit" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "resourceType" text NOT NULL, "operationType" text NOT NULL, "spenderType" text NOT NULL, "spenderId" text NOT NULL DEFAULT \'\', "limitKind" text NOT NULL, "windowSeconds" integer NOT NULL DEFAULT \'0\', "limitType" text NOT NULL DEFAULT \'absolute\', "limitValue" bigint NOT NULL, "burstValue" bigint, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_USAGE_LIMIT_SCOPE" UNIQUE ("workspaceId", "resourceType", "operationType", "spenderType", "spenderId", "limitKind", "windowSeconds"), CONSTRAINT "PK_aa789af8757d2ef28a0416df290" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_USAGE_LIMIT_WORKSPACE_ID" ON "core"."usageLimit" ("workspaceId") ');
    await queryRunner.query('ALTER TABLE "core"."usageLimit" ADD CONSTRAINT "FK_262e7eabfa66b9724f7bf45628e" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."usageLimit" DROP CONSTRAINT "FK_262e7eabfa66b9724f7bf45628e"');
    await queryRunner.query('DROP INDEX "core"."IDX_USAGE_LIMIT_WORKSPACE_ID"');
    await queryRunner.query('DROP TABLE "core"."usageLimit"');
  }
}
