import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.51.0', 1792675225627, { type: 'slow' })
export class DeleteConnectedAccountsOutsideProviderScopeSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      'DELETE FROM "core"."connectedAccount" "connectedAccount" USING "core"."connectionProvider" "connectionProvider" WHERE "connectedAccount"."connectionProviderId" = "connectionProvider"."id" AND "connectedAccount"."scope" <> "connectionProvider"."scope"::text',
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
