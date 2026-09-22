import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1790085198967)
export class AddDeferredWorkspaceMigrationActionTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."deferredWorkspaceMigrationAction" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "applicationUniversalIdentifier" character varying NOT NULL, "actionHandlerKey" character varying NOT NULL, "payload" jsonb NOT NULL, "position" integer NOT NULL, "runByVersion" character varying, "status" character varying NOT NULL DEFAULT \'PENDING\', "attempts" integer NOT NULL DEFAULT \'0\', "lastError" text, "startedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_eb96f18b805c453f3375b9d1aea" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_DEFERRED_WORKSPACE_MIGRATION_ACTION_WORKSPACE_ID_STATUS" ON "core"."deferredWorkspaceMigrationAction" ("workspaceId", "status") ');
    await queryRunner.query('ALTER TABLE "core"."deferredWorkspaceMigrationAction" ADD CONSTRAINT "FK_c3810cd3a6109f5e1bf6f84c60f" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."deferredWorkspaceMigrationAction" DROP CONSTRAINT "FK_c3810cd3a6109f5e1bf6f84c60f"');
    await queryRunner.query('DROP INDEX "core"."IDX_DEFERRED_WORKSPACE_MIGRATION_ACTION_WORKSPACE_ID_STATUS"');
    await queryRunner.query('DROP TABLE "core"."deferredWorkspaceMigrationAction"');
  }
}
