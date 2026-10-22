import { type DataSource, type QueryRunner } from 'typeorm';

import { BackfillApplicationRegistrationVersionsSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-instance-command-slow-1792077361238-backfill-application-registration-versions';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.51.0', 1792655604266, { type: 'slow' })
export class RepairBackfillApplicationRegistrationVersionsSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await new BackfillApplicationRegistrationVersionsSlowInstanceCommand().runDataMigration(
      dataSource,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
