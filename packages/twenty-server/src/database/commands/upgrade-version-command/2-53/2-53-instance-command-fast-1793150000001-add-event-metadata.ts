import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.53.0', 1793150000001)
export class AddEventMetadataFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."eventMetadata" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "label" character varying NOT NULL, "description" character varying, "icon" character varying, "properties" jsonb NOT NULL DEFAULT \'[]\', "capabilities" jsonb NOT NULL DEFAULT \'{}\', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_EVENT_METADATA_NAME_APPLICATION_UNIQUE" UNIQUE ("name", "applicationId"), CONSTRAINT "PK_7762390924658f4d3ad88c45be0" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_25498309556838797b6c1860a6" ON "core"."eventMetadata" ("workspaceId", "universalIdentifier") ');
    await queryRunner.query('CREATE INDEX "IDX_EVENT_METADATA_APPLICATION_ID" ON "core"."eventMetadata" ("applicationId") ');
    await queryRunner.query('ALTER TABLE "core"."eventMetadata" ADD CONSTRAINT "FK_e584d68ed4df0ac6a55369e3409" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."eventMetadata" ADD CONSTRAINT "FK_182f395d45e14acb2fcf93ae34b" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."eventMetadata" DROP CONSTRAINT "FK_182f395d45e14acb2fcf93ae34b"');
    await queryRunner.query('ALTER TABLE "core"."eventMetadata" DROP CONSTRAINT "FK_e584d68ed4df0ac6a55369e3409"');
    await queryRunner.query('DROP INDEX "core"."IDX_EVENT_METADATA_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_25498309556838797b6c1860a6"');
    await queryRunner.query('DROP TABLE "core"."eventMetadata"');
  }
}
