import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.58.0', 1794237199085)
export class AddMaxRateToWorkflowAndLogicFunctionFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ADD "maxRate" jsonb NOT NULL DEFAULT \'{"max":100,"durationMs":60000}\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" ADD "maxRate" jsonb',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" DROP COLUMN "maxRate"',
    );
    await queryRunner.query('ALTER TABLE "core"."workflow" DROP COLUMN "maxRate"');
  }
}
