import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.20.0', 1783499671541)
export class AllowServerScopedFileFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."file" ADD "applicationRegistrationId" uuid');
    await queryRunner.query('ALTER TABLE "core"."file" DROP CONSTRAINT "FK_de468b3d8dcf7e94f7074220929"');
    await queryRunner.query('ALTER TABLE "core"."file" DROP CONSTRAINT "IDX_APPLICATION_PATH_WORKSPACE_ID_APPLICATION_ID_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."file" ALTER COLUMN "workspaceId" DROP NOT NULL');
    await queryRunner.query('ALTER TABLE "core"."file" ADD CONSTRAINT "IDX_FILE_APPLICATION_REGISTRATION_ID_PATH_UNIQUE" UNIQUE ("applicationRegistrationId", "path")');
    await queryRunner.query('CREATE INDEX "IDX_FILE_APPLICATION_REGISTRATION_ID" ON "core"."file" ("applicationRegistrationId") ');
    await queryRunner.query('ALTER TABLE "core"."file" ADD CONSTRAINT "IDX_APPLICATION_PATH_WORKSPACE_ID_APPLICATION_ID_UNIQUE" UNIQUE ("workspaceId", "applicationId", "path")');
    await queryRunner.query('ALTER TABLE "core"."file" ADD CONSTRAINT "FK_de468b3d8dcf7e94f7074220929" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."file" ADD CONSTRAINT "FK_feffd2addf9467be6d7cd51db76" FOREIGN KEY ("applicationRegistrationId") REFERENCES "core"."applicationRegistration"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."file" ADD CONSTRAINT "CHK_FILE_WORKSPACE_ID_OR_APPLICATION_REGISTRATION_ID" CHECK ("workspaceId" IS NOT NULL OR "applicationRegistrationId" IS NOT NULL)');
    await queryRunner.query('ALTER TABLE "core"."file" ADD CONSTRAINT "CHK_FILE_WORKSPACE_ID_XOR_APPLICATION_REGISTRATION_ID" CHECK ("workspaceId" IS NULL OR "applicationRegistrationId" IS NULL)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."file" DROP CONSTRAINT "CHK_FILE_WORKSPACE_ID_XOR_APPLICATION_REGISTRATION_ID"');
    await queryRunner.query('ALTER TABLE "core"."file" DROP CONSTRAINT "CHK_FILE_WORKSPACE_ID_OR_APPLICATION_REGISTRATION_ID"');
    await queryRunner.query('ALTER TABLE "core"."file" DROP CONSTRAINT "FK_feffd2addf9467be6d7cd51db76"');
    await queryRunner.query('ALTER TABLE "core"."file" DROP CONSTRAINT "FK_de468b3d8dcf7e94f7074220929"');
    await queryRunner.query('ALTER TABLE "core"."file" DROP CONSTRAINT "IDX_APPLICATION_PATH_WORKSPACE_ID_APPLICATION_ID_UNIQUE"');
    await queryRunner.query('DROP INDEX "core"."IDX_FILE_APPLICATION_REGISTRATION_ID"');
    await queryRunner.query('ALTER TABLE "core"."file" DROP CONSTRAINT "IDX_FILE_APPLICATION_REGISTRATION_ID_PATH_UNIQUE"');
    // Server-scoped rows cannot survive the NOT NULL restore.
    await queryRunner.query('DELETE FROM "core"."file" WHERE "workspaceId" IS NULL');
    await queryRunner.query('ALTER TABLE "core"."file" ALTER COLUMN "workspaceId" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "core"."file" ADD CONSTRAINT "IDX_APPLICATION_PATH_WORKSPACE_ID_APPLICATION_ID_UNIQUE" UNIQUE ("workspaceId", "applicationId", "path")');
    await queryRunner.query('ALTER TABLE "core"."file" ADD CONSTRAINT "FK_de468b3d8dcf7e94f7074220929" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."file" DROP COLUMN "applicationRegistrationId"');
  }
}
