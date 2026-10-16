import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Until this runs, workspace-shared connections created before the upgrade read
// as personal: they are hidden from other members rather than exposed.
@RegisteredInstanceCommand('2.49.0', 1792149961611, { type: 'slow' })
export class BackfillConnectedAccountScopeSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      'UPDATE "core"."connectedAccount" SET "scope" = upper("visibility") WHERE "scope" <> upper("visibility")',
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  // The paired fast command owns the column, so there is no schema to undo here.
  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
