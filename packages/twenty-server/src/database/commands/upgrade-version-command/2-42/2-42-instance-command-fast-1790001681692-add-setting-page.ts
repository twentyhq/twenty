import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1790001681692)
export class AddSettingPageFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."settingPage_scope_enum" AS ENUM(\'WORKSPACE\', \'USER\')');
    await queryRunner.query('CREATE TABLE "core"."settingPage" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "frontComponentId" uuid NOT NULL, "title" character varying NOT NULL, "icon" character varying, "position" double precision NOT NULL DEFAULT \'0\', "scope" "core"."settingPage_scope_enum" NOT NULL DEFAULT \'WORKSPACE\', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7e404463b7409f267826d27cecd" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_e2d7557a55c83b1afebf2902df" ON "core"."settingPage" ("workspaceId", "universalIdentifier") ');
    await queryRunner.query('CREATE INDEX "IDX_SETTING_PAGE_WORKSPACE_ID_APPLICATION_ID" ON "core"."settingPage" ("workspaceId", "applicationId") ');
    await queryRunner.query('CREATE INDEX "IDX_SETTING_PAGE_FRONT_COMPONENT_ID" ON "core"."settingPage" ("frontComponentId") ');
    await queryRunner.query('ALTER TABLE "core"."settingPage" ADD CONSTRAINT "FK_9ed73020555711132e5f4907d49" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."settingPage" ADD CONSTRAINT "FK_3a6025dd4128d66d61cb919040e" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."settingPage" ADD CONSTRAINT "FK_1cf333f52148d649d357bfe4285" FOREIGN KEY ("frontComponentId") REFERENCES "core"."frontComponent"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."settingPage" DROP CONSTRAINT "FK_1cf333f52148d649d357bfe4285"');
    await queryRunner.query('ALTER TABLE "core"."settingPage" DROP CONSTRAINT "FK_3a6025dd4128d66d61cb919040e"');
    await queryRunner.query('ALTER TABLE "core"."settingPage" DROP CONSTRAINT "FK_9ed73020555711132e5f4907d49"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETTING_PAGE_FRONT_COMPONENT_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETTING_PAGE_WORKSPACE_ID_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_e2d7557a55c83b1afebf2902df"');
    await queryRunner.query('DROP TABLE "core"."settingPage"');
    await queryRunner.query('DROP TYPE "core"."settingPage_scope_enum"');
  }
}
