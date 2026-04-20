import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('1.24.0', 1786000000000)
export class SetCalendarEventDescriptionDisplayedMaxRowsFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."fieldMetadata"
       SET "settings" = jsonb_set(COALESCE("settings", '{}'), '{displayedMaxRows}', '99')
       WHERE "name" = 'description'
         AND "objectMetadataId" IN (
           SELECT "id" FROM "core"."objectMetadata"
           WHERE "nameSingular" = 'calendarEvent'
         )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."fieldMetadata"
       SET "settings" = "settings" - 'displayedMaxRows'
       WHERE "name" = 'description'
         AND "objectMetadataId" IN (
           SELECT "id" FROM "core"."objectMetadata"
           WHERE "nameSingular" = 'calendarEvent'
         )`,
    );
  }
}
