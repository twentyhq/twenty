import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.2.0', 1786000000000, { type: 'slow' })
export class SetCalendarEventDescriptionDisplayedMaxRowsSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."fieldMetadata"
       SET "settings" = jsonb_set(COALESCE("settings", '{}'), '{displayedMaxRows}', '99')
       WHERE "name" = 'description'
         AND "objectMetadataId" IN (
           SELECT "id" FROM "core"."objectMetadata"
           WHERE "nameSingular" = 'calendarEvent'
         )`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
