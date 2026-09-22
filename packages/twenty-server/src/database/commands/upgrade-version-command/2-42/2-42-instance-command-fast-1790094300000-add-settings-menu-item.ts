import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1790094300000)
export class AddSettingsMenuItemFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."settingsMenuItem_scope_enum" AS ENUM(\'WORKSPACE\', \'USER\')');
    await queryRunner.query('CREATE TABLE "core"."settingsMenuItem" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "frontComponentId" uuid NOT NULL, "title" character varying NOT NULL, "icon" character varying, "position" double precision NOT NULL DEFAULT \'0\', "scope" "core"."settingsMenuItem_scope_enum" NOT NULL DEFAULT \'WORKSPACE\', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7e404463b7409f267826d27cecd" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_c28134c55ca1acff4e9d53d46e" ON "core"."settingsMenuItem" ("workspaceId", "universalIdentifier") ');
    await queryRunner.query('CREATE INDEX "IDX_SETTINGS_MENU_ITEM_WORKSPACE_ID_APPLICATION_ID" ON "core"."settingsMenuItem" ("workspaceId", "applicationId") ');
    await queryRunner.query('CREATE INDEX "IDX_SETTINGS_MENU_ITEM_FRONT_COMPONENT_ID" ON "core"."settingsMenuItem" ("frontComponentId") ');
    await queryRunner.query('ALTER TABLE "core"."settingsMenuItem" ADD CONSTRAINT "FK_06777107034316d88f8f9deb058" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."settingsMenuItem" ADD CONSTRAINT "FK_110a68950a78f6b30316cad894f" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."settingsMenuItem" ADD CONSTRAINT "FK_8464a234a1389b2c9783408d210" FOREIGN KEY ("frontComponentId") REFERENCES "core"."frontComponent"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."settingsMenuItem" DROP CONSTRAINT "FK_8464a234a1389b2c9783408d210"');
    await queryRunner.query('ALTER TABLE "core"."settingsMenuItem" DROP CONSTRAINT "FK_110a68950a78f6b30316cad894f"');
    await queryRunner.query('ALTER TABLE "core"."settingsMenuItem" DROP CONSTRAINT "FK_06777107034316d88f8f9deb058"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETTINGS_MENU_ITEM_FRONT_COMPONENT_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_SETTINGS_MENU_ITEM_WORKSPACE_ID_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_c28134c55ca1acff4e9d53d46e"');
    await queryRunner.query('DROP TABLE "core"."settingsMenuItem"');
    await queryRunner.query('DROP TYPE "core"."settingsMenuItem_scope_enum"');
  }
}
