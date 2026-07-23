import { type QueryRunner } from 'typeorm';

import {
  dropApplicationRegistrationLogoFileIdColumn,
  ensureApplicationRegistrationLogoFileIdColumn,
} from 'src/database/commands/upgrade-version-command/2-23/utils/ensure-application-registration-logo-file-id-column.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Re-slots the 2.21 add-logo-file-id DDL at the end of the 2.23 fast segment:
// the 2.21 command landed after the 2.22 bump and is skipped forever on
// instances whose cursor is already past that slot.
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
