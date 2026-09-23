import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1790161900000)
export class AddWorkspaceSchemaMigrationLockTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."workspaceSchemaMigrationLock" ("workspaceId" uuid NOT NULL, "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_WORKSPACE_SCHEMA_MIGRATION_LOCK_WORKSPACE_ID" PRIMARY KEY ("workspaceId"))');
    await queryRunner.query('ALTER TABLE "core"."workspaceSchemaMigrationLock" ADD CONSTRAINT "FK_WORKSPACE_SCHEMA_MIGRATION_LOCK_WORKSPACE_ID" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."workspaceSchemaMigrationLock" DROP CONSTRAINT "FK_WORKSPACE_SCHEMA_MIGRATION_LOCK_WORKSPACE_ID"');
    await queryRunner.query('DROP TABLE "core"."workspaceSchemaMigrationLock"');
  }
}
