import { type QueryRunner } from 'typeorm';

import { ensureUsageLimitMeterCompatibility } from 'src/database/commands/upgrade-version-command/2-46/utils/ensure-usage-limit-meter-compatibility.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.46.0', 1791538680877)
export class RestoreUsageLimitMeterCompatibilityFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await ensureUsageLimitMeterCompatibility(queryRunner);
  }

  // The earlier command's down owns both columns; removing compatibility alone breaks old readers.
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
