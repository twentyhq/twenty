import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1789724121847, { type: 'slow' })
export class BackfillFrontComponentSettingsTabSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    BackfillFrontComponentSettingsTabSlowInstanceCommand.name,
  );

  // The application used to point at its single settings component; a
  // non-null settingsTab is what marks one from now on, so carry the
  // existing pointer over before it stops being read. That component stood in
  // for the generated Variables tab rather than sitting next to it, so it is
  // backfilled with that tab's own label, icon and position. The values are
  // inlined rather than read from DEFAULT_FRONT_COMPONENT_SETTINGS_TAB so this
  // migration keeps writing what it wrote the day it ran.
  async runDataMigration(dataSource: DataSource): Promise<void> {
    const backfilledFrontComponents: { id: string }[] = await dataSource.query(
      `UPDATE "core"."frontComponent" "frontComponent"
       SET "settingsTab" = '{"label": "Variables", "icon": "IconVariable", "position": 0}'::jsonb
       FROM "core"."application" "application"
       WHERE "application"."settingsCustomTabFrontComponentId" = "frontComponent"."id"
         AND "frontComponent"."settingsTab" IS NULL
       RETURNING "frontComponent"."id"`,
    );

    this.logger.log(
      `Backfilled ${backfilledFrontComponents.length} settings front component(s)`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
