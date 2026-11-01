import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// 2.46 stopped reading evaluationInputs, and 2.45 servers still map it while
// 2.46 rolls out, so it is dropped one release later
@RegisteredInstanceCommand('2.47.0', 1791401524803)
export class DropAgentEvaluationInputsDeferredFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP COLUMN IF EXISTS "evaluationInputs"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD COLUMN IF NOT EXISTS "evaluationInputs" text array NOT NULL DEFAULT '{}'`,
    );
  }
}
