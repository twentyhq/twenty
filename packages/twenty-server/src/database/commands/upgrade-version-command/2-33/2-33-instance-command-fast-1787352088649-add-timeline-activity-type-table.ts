import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.33.0', 1787352088649)
export class AddTimelineActivityTypeTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."timelineActivityType" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "label" character varying NOT NULL, "action" character varying, "icon" character varying, "renderer" character varying, "objectUniversalIdentifier" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_TIMELINE_ACTIVITY_TYPE_NAME_APPLICATION_WORKSPACE_UNIQUE" UNIQUE ("name", "applicationId", "workspaceId"), CONSTRAINT "PK_65c4ac97169ca5241f0f17b5a44" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_2cabff7ba187115afcdd1cf6ba" ON "core"."timelineActivityType" ("workspaceId", "universalIdentifier") ');
    await queryRunner.query('ALTER TABLE "core"."timelineActivityType" ADD CONSTRAINT "FK_9dff241d7d796da9f63a8ae4bc6" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."timelineActivityType" ADD CONSTRAINT "FK_2c7b4a18f54e8da1956a7a7dd60" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."timelineActivityType" DROP CONSTRAINT "FK_2c7b4a18f54e8da1956a7a7dd60"');
    await queryRunner.query('ALTER TABLE "core"."timelineActivityType" DROP CONSTRAINT "FK_9dff241d7d796da9f63a8ae4bc6"');
    await queryRunner.query('DROP INDEX "core"."IDX_2cabff7ba187115afcdd1cf6ba"');
    await queryRunner.query('DROP TABLE "core"."timelineActivityType"');
  }
}
