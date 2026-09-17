import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1789656830374, { type: 'slow' })
export class BackfillFrontComponentSettingsTabSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    BackfillFrontComponentSettingsTabSlowInstanceCommand.name,
  );

  // The application used to point at its single settings component; a
  // non-null settingsTab is what marks one from now on, so carry the
  // existing pointer over before it stops being read.
  async runDataMigration(dataSource: DataSource): Promise<void> {
    const backfilledFrontComponents: { id: string }[] = await dataSource.query(
      `UPDATE "core"."frontComponent" "frontComponent"
       SET "settingsTab" = '{}'::jsonb
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
