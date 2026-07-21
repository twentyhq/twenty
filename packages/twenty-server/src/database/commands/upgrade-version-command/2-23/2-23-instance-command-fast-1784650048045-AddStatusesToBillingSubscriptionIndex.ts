import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.23.0', 1784650048045)
export class AddStatusesToBillingSubscriptionIndexFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingSubscription'`,
    );

    if (tableExists.length === 0) {
      return;
    }

    await queryRunner.query(
      'DROP INDEX "core"."IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE"',
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
      'DROP INDEX "core"."IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE"',
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE" ON "core"."billingSubscription" ("workspaceId") WHERE status IN ('trialing', 'active', 'past_due')`,
    );
  }
}
