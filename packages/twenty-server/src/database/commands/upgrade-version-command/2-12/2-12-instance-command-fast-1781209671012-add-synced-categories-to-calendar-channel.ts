import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Per-channel allowlist of provider-side event categories (e.g. Outlook
// categories); empty means every event is synced.
@RegisteredInstanceCommand('2.12.0', 1781209671012)
export class AddSyncedCategoriesToCalendarChannelFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."calendarChannel"
       ADD COLUMN IF NOT EXISTS "syncedCategories" character varying array NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."calendarChannel" DROP COLUMN IF EXISTS "syncedCategories"`,
    );
  }
}
