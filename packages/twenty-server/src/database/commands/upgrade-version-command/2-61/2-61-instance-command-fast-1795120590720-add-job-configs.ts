import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795120590720)
export class AddJobConfigsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" ADD "jobConfigKeys" text array NOT NULL DEFAULT \'{}\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."application" ADD "jobConfigs" jsonb NOT NULL DEFAULT \'[]\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."application" DROP COLUMN "jobConfigs"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" DROP COLUMN "jobConfigKeys"',
    );
  }
}
