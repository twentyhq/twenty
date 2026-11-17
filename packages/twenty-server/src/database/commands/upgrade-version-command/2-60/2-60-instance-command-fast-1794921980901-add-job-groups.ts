import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.60.0', 1794921980901)
export class AddJobGroupsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "core"."jobGroup" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "limiter" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_JOB_GROUP_WORKSPACE_ID_KEY" UNIQUE ("workspaceId", "key"), CONSTRAINT "PK_90f15797c5c6139e5f40bb6c8a1" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."jobGroup" ADD CONSTRAINT "FK_7ad84ff11ca4d8703cc5278b371" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ADD "jobGroupKeys" text array NOT NULL DEFAULT \'{workflow}\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" ADD "jobGroupKeys" text array NOT NULL DEFAULT \'{}\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" DROP COLUMN "jobGroupKeys"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" DROP COLUMN "jobGroupKeys"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."jobGroup" DROP CONSTRAINT "FK_7ad84ff11ca4d8703cc5278b371"',
    );
    await queryRunner.query('DROP TABLE "core"."jobGroup"');
  }
}
