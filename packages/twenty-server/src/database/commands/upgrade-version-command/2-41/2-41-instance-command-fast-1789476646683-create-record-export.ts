import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.41.0', 1789476646683)
export class CreateRecordExportFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."recordExport" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userWorkspaceId" uuid NOT NULL, "workspaceMemberId" uuid NOT NULL, "parameters" jsonb NOT NULL, "filename" text NOT NULL, "status" text NOT NULL DEFAULT \'QUEUED\', "processedRecordCount" integer NOT NULL DEFAULT \'0\', "jobId" text, "attemptId" uuid, "filePath" text, "errorMessage" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_79f91d8955cfe29ba2ab45c2ab0" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_RECORD_EXPORT_ACTIVE_WORKSPACE" ON "core"."recordExport" ("workspaceId") WHERE "status" IN (\'QUEUED\', \'PROCESSING\')');
    await queryRunner.query('CREATE INDEX "IDX_RECORD_EXPORT_EXPIRES_AT" ON "core"."recordExport" ("expiresAt") ');
    await queryRunner.query('CREATE INDEX "IDX_RECORD_EXPORT_REQUESTER" ON "core"."recordExport" ("workspaceId", "userWorkspaceId", "createdAt") ');
    await queryRunner.query('ALTER TABLE "core"."recordExport" ADD CONSTRAINT "FK_6e93e7e9dc71244fffc4fd82a92" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."recordExport" DROP CONSTRAINT "FK_6e93e7e9dc71244fffc4fd82a92"');
    await queryRunner.query('DROP INDEX "core"."IDX_RECORD_EXPORT_REQUESTER"');
    await queryRunner.query('DROP INDEX "core"."IDX_RECORD_EXPORT_EXPIRES_AT"');
    await queryRunner.query('DROP INDEX "core"."IDX_RECORD_EXPORT_ACTIVE_WORKSPACE"');
    await queryRunner.query('DROP TABLE "core"."recordExport"');
  }
}
