import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// 2.45 servers still map evaluationInputs while a deploy rolls out, so the
// column is dropped in 2.47 by drop-agent-evaluation-inputs. This step stays
// so instances that already recorded it keep a known upgrade cursor.
@RegisteredInstanceCommand('2.46.0', 1791216099453)
export class DropAgentEvaluationInputsFastInstanceCommand implements FastInstanceCommand {
  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
