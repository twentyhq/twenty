import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.48.0', 1792077317736)
export class AddApplicationRegistrationVersionsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."applicationRegistrationVersion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "applicationRegistrationId" uuid NOT NULL, "version" text NOT NULL, "sourceType" text NOT NULL, "sourcePackage" text, "tarballFileId" uuid, "tarballUrl" text, "checksum" text, "publishedByUserId" uuid, "publishedByWorkspaceId" uuid, "publishedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reviewState" text NOT NULL DEFAULT \'UNREVIEWED\', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_APP_REG_VERSION_APP_REGISTRATION_ID_VERSION_UNIQUE" UNIQUE ("applicationRegistrationId", "version"), CONSTRAINT "CHK_APP_REG_VERSION_NPM_HAS_SOURCE_PACKAGE" CHECK ("sourceType" <> \'npm\' OR "sourcePackage" IS NOT NULL), CONSTRAINT "PK_bfa9041162e158e878354984852" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_APP_REG_VERSION_TARBALL_FILE_ID" ON "core"."applicationRegistrationVersion" ("tarballFileId") ');
    await queryRunner.query('ALTER TABLE "core"."application" ADD "applicationRegistrationVersionId" uuid');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistrationVersion" ADD CONSTRAINT "FK_02169996cebff7ce601ef1a8856" FOREIGN KEY ("applicationRegistrationId") REFERENCES "core"."applicationRegistration"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistrationVersion" ADD CONSTRAINT "FK_d0a422e76f4d8289dd6c18c538c" FOREIGN KEY ("tarballFileId") REFERENCES "core"."file"("id") ON DELETE SET NULL ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistrationVersion" ADD CONSTRAINT "FK_7a940ac30723b164a902b26d79a" FOREIGN KEY ("publishedByUserId") REFERENCES "core"."user"("id") ON DELETE SET NULL ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistrationVersion" ADD CONSTRAINT "FK_ca6bb88ef590e25ffa40856f9e4" FOREIGN KEY ("publishedByWorkspaceId") REFERENCES "core"."workspace"("id") ON DELETE SET NULL ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."application" ADD CONSTRAINT "FK_aa9bbe0e21d7f6a35cc829e5da0" FOREIGN KEY ("applicationRegistrationVersionId") REFERENCES "core"."applicationRegistrationVersion"("id") ON DELETE SET NULL ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."application" DROP CONSTRAINT "FK_aa9bbe0e21d7f6a35cc829e5da0"');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistrationVersion" DROP CONSTRAINT "FK_ca6bb88ef590e25ffa40856f9e4"');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistrationVersion" DROP CONSTRAINT "FK_7a940ac30723b164a902b26d79a"');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistrationVersion" DROP CONSTRAINT "FK_d0a422e76f4d8289dd6c18c538c"');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistrationVersion" DROP CONSTRAINT "FK_02169996cebff7ce601ef1a8856"');
    await queryRunner.query('ALTER TABLE "core"."application" DROP COLUMN "applicationRegistrationVersionId"');
    await queryRunner.query('DROP INDEX "core"."IDX_APP_REG_VERSION_TARBALL_FILE_ID"');
    await queryRunner.query('DROP TABLE "core"."applicationRegistrationVersion"');
  }
}
