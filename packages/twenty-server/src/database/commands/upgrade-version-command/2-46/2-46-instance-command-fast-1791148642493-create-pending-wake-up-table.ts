import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.46.0', 1791148642493)
export class CreatePendingWakeUpTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."pendingWakeUp" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ownerType" character varying NOT NULL, "ownerId" uuid NOT NULL, "ownerKey" character varying NOT NULL, "condition" jsonb NOT NULL, "eventName" character varying, "resumeAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_PENDING_WAKE_UP_OWNER" UNIQUE ("ownerType", "ownerId", "ownerKey"), CONSTRAINT "PK_cbc9e34921b29ba23534bc3a2e5" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_PENDING_WAKE_UP_RESUME_AT" ON "core"."pendingWakeUp" ("resumeAt") ');
    await queryRunner.query('CREATE INDEX "IDX_PENDING_WAKE_UP_WORKSPACE_EVENT_NAME" ON "core"."pendingWakeUp" ("workspaceId", "eventName") ');
    await queryRunner.query('ALTER TABLE "core"."pendingWakeUp" ADD CONSTRAINT "FK_15bba3e321919925d62262a14a2" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."pendingWakeUp" DROP CONSTRAINT "FK_15bba3e321919925d62262a14a2"');
    await queryRunner.query('DROP INDEX "core"."IDX_PENDING_WAKE_UP_WORKSPACE_EVENT_NAME"');
    await queryRunner.query('DROP INDEX "core"."IDX_PENDING_WAKE_UP_RESUME_AT"');
    await queryRunner.query('DROP TABLE "core"."pendingWakeUp"');
  }
}
