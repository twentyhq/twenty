import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.59.0', 1794548930894)
export class AddViewTabFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."viewTab_type_enum" AS ENUM(\'FIELD_VALUE\', \'NO_VALUE\', \'ALL\', \'CUSTOM\')');
    await queryRunner.query('CREATE TABLE "core"."viewTab" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "core"."viewTab_type_enum" NOT NULL, "fieldValue" text, "name" text, "position" double precision NOT NULL DEFAULT \'0\', "isVisible" boolean NOT NULL DEFAULT true, "viewId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8f518f0ee3b39147e66253d5c7e" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_d1f2b1a35cf8bc0d2dc8cb5bee" ON "core"."viewTab" ("workspaceId", "universalIdentifier") ');
    await queryRunner.query('CREATE INDEX "IDX_VIEW_TAB_VIEW_ID" ON "core"."viewTab" ("viewId") ');
    await queryRunner.query('CREATE INDEX "IDX_VIEW_TAB_WORKSPACE_ID_VIEW_ID" ON "core"."viewTab" ("workspaceId", "viewId") ');
    await queryRunner.query('CREATE INDEX "IDX_VIEW_TAB_APPLICATION_ID" ON "core"."viewTab" ("applicationId") ');
    await queryRunner.query('ALTER TABLE "core"."viewFilter" ADD "viewTabId" uuid');
    await queryRunner.query('CREATE INDEX "IDX_VIEW_FILTER_VIEW_TAB_ID" ON "core"."viewFilter" ("viewTabId") WHERE "viewTabId" IS NOT NULL');
    await queryRunner.query('ALTER TABLE "core"."viewTab" ADD CONSTRAINT "FK_92abb1d6ee186d750bc2f12495e" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."viewTab" ADD CONSTRAINT "FK_bfabf3acaaece7ec72e6bf80712" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."viewTab" ADD CONSTRAINT "FK_03deb51859332388236dbcb624b" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_ded136f77e35427fa690c6a1f9b" FOREIGN KEY ("viewTabId") REFERENCES "core"."viewTab"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_ded136f77e35427fa690c6a1f9b"');
    await queryRunner.query('ALTER TABLE "core"."viewTab" DROP CONSTRAINT "FK_03deb51859332388236dbcb624b"');
    await queryRunner.query('ALTER TABLE "core"."viewTab" DROP CONSTRAINT "FK_bfabf3acaaece7ec72e6bf80712"');
    await queryRunner.query('ALTER TABLE "core"."viewTab" DROP CONSTRAINT "FK_92abb1d6ee186d750bc2f12495e"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_FILTER_VIEW_TAB_ID"');
    await queryRunner.query('ALTER TABLE "core"."viewFilter" DROP COLUMN "viewTabId"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_TAB_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_TAB_WORKSPACE_ID_VIEW_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_TAB_VIEW_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_d1f2b1a35cf8bc0d2dc8cb5bee"');
    await queryRunner.query('DROP TABLE "core"."viewTab"');
    await queryRunner.query('DROP TYPE "core"."viewTab_type_enum"');
  }
}
