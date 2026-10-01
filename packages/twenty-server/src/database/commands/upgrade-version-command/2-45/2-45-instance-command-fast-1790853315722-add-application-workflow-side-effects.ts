import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.45.0', 1790853315722)
export class AddApplicationWorkflowSideEffectsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."workflow" ADD "versionDefinitionHash" text');
    await queryRunner.query('ALTER TABLE "core"."workflowVersion" ADD "isSystemSideEffect" boolean NOT NULL DEFAULT false');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."workflowVersion" DROP COLUMN "isSystemSideEffect"');
    await queryRunner.query('ALTER TABLE "core"."workflow" DROP COLUMN "versionDefinitionHash"');
  }
}
