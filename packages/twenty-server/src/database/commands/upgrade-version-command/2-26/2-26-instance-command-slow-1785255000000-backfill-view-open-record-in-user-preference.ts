import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// SIDE_PANEL was the value every view got before USER_PREFERENCE existed, so a
// view still on it was never a deliberate choice. Handing those views to the
// member preference changes nothing on the day of the upgrade, since the
// preference itself starts at SIDE_PANEL. Rolling back is handled by the enum
// command's down(), which has to empty the value before dropping it anyway.
@RegisteredInstanceCommand('2.26.0', 1785255000000, { type: 'slow' })
export class BackfillViewOpenRecordInUserPreferenceSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."view" SET "openRecordIn" = 'USER_PREFERENCE' WHERE "openRecordIn" = 'SIDE_PANEL'`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
