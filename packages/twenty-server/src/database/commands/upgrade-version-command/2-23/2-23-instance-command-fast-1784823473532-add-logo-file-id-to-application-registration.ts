import { type QueryRunner } from 'typeorm';

import {
  dropApplicationRegistrationLogoFileIdColumn,
  ensureApplicationRegistrationLogoFileIdColumn,
} from 'src/database/commands/upgrade-version-command/2-23/utils/ensure-application-registration-logo-file-id-column.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Re-run of the 2.21 add-logo-file-id command, which shipped in the 2.21 slot
// but only landed after the 2.22 version bump. Instances that already ran a
// 2.21 binary have their upgrade cursor past that slot, so the original command
// is skipped forever and the column never gets created. This re-slots the same
// idempotent DDL at the end of the 2.23 fast segment to reach those cursors.
@RegisteredInstanceCommand('2.23.0', 1784823473532)
export class AddLogoFileIdToApplicationRegistration2_23FastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await ensureApplicationRegistrationLogoFileIdColumn((sql) =>
      queryRunner.query(sql),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropApplicationRegistrationLogoFileIdColumn((sql) =>
      queryRunner.query(sql),
    );
  }
}
