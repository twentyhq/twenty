import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1794932308059)
export class DropJobConfigFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."logicFunction" DROP COLUMN "jobConfig"');
    await queryRunner.query('ALTER TABLE "core"."workflow" DROP COLUMN "jobConfig"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."workflow" ADD "jobConfig" jsonb NOT NULL DEFAULT \'{"limiter": {"max": 100, "durationMs": 60000}}\'');
    await queryRunner.query('ALTER TABLE "core"."logicFunction" ADD "jobConfig" jsonb');
  }
}
