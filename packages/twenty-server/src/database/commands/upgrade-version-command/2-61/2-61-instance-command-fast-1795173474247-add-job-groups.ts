import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795173474247)
export class AddJobGroupsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."jobGroup" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "limiter" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_90f15797c5c6139e5f40bb6c8a1" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_04b182ff57e3658d78f71183cb" ON "core"."jobGroup" ("workspaceId", "universalIdentifier") ');
    await queryRunner.query('CREATE INDEX "IDX_JOB_GROUP_WORKSPACE_ID_APPLICATION_ID" ON "core"."jobGroup" ("workspaceId", "applicationId") ');
    await queryRunner.query('ALTER TABLE "core"."jobGroup" ADD CONSTRAINT "FK_7ad84ff11ca4d8703cc5278b371" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."jobGroup" ADD CONSTRAINT "FK_4427e8031cb1bad9726d84627f1" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."logicFunction" ADD "jobGroupUniversalIdentifiers" uuid array NOT NULL DEFAULT \'{}\'');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."logicFunction" DROP COLUMN "jobGroupUniversalIdentifiers"');
    await queryRunner.query('ALTER TABLE "core"."jobGroup" DROP CONSTRAINT "FK_4427e8031cb1bad9726d84627f1"');
    await queryRunner.query('ALTER TABLE "core"."jobGroup" DROP CONSTRAINT "FK_7ad84ff11ca4d8703cc5278b371"');
    await queryRunner.query('DROP INDEX "core"."IDX_JOB_GROUP_WORKSPACE_ID_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_04b182ff57e3658d78f71183cb"');
    await queryRunner.query('DROP TABLE "core"."jobGroup"');
  }
}
