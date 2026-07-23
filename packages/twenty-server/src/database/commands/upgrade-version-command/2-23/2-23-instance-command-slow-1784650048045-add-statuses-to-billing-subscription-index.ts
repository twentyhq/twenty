import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.23.0', 1784650048045, { type: 'slow' })
export class AddStatusesToBillingSubscriptionIndexSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(_dataSource: DataSource): Promise<void> {}

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingSubscription'`,
    );

    if (tableExists.length === 0) {
      return;
    }

    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE"',
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE" ON "core"."billingSubscription" ("workspaceId") WHERE status IN ('trialing', 'active', 'past_due', 'incomplete', 'incomplete_expired', 'unpaid', 'paused')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingSubscription'`,
    );

    if (tableExists.length === 0) {
      return;
    }

    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE"',
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE" ON "core"."billingSubscription" ("workspaceId") WHERE status IN ('trialing', 'active', 'past_due')`,
    );
  }
}
