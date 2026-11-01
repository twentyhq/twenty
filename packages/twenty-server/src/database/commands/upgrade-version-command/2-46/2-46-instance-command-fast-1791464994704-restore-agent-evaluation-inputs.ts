import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Instances that ran the 2.46 drop before it became a no-op lost a column the
// 2.46 entity still maps until the 2.47 drop
@RegisteredInstanceCommand('2.46.0', 1791464994704)
export class RestoreAgentEvaluationInputsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD COLUMN IF NOT EXISTS "evaluationInputs" text array NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
