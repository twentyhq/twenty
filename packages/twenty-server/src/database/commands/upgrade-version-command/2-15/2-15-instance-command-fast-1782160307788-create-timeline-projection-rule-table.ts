import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.15.0', 1782160307788)
export class CreateTimelineProjectionRuleTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."timelineProjectionRule" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "anchorObjectMetadataId" uuid NOT NULL, "sourceObjectMetadataId" uuid NOT NULL, "linkedObjectMetadataIds" uuid array NOT NULL, CONSTRAINT "PK_82971148a2cbe77426a70c1d2a1" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "core"."timelineProjectionRule" ADD CONSTRAINT "FK_02ba5e858a2638cbdb4d33b9ede" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."timelineProjectionRule" DROP CONSTRAINT "FK_02ba5e858a2638cbdb4d33b9ede"');
    await queryRunner.query('DROP TABLE "core"."timelineProjectionRule"');
  }
}
