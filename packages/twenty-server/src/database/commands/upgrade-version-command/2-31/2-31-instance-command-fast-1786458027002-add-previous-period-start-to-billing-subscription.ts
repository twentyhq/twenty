import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Records where the period before the current one began, which Stripe never
// reports. Left null on existing rows: the rollover falls back to the ledger
// and then to calendar arithmetic until each subscription's next transition
// fills it in.
@RegisteredInstanceCommand('2.31.0', 1786458027002)
export class AddPreviousPeriodStartToBillingSubscriptionFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const isBillingSchemaPresent = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingSubscription'`,
    );

    if (isBillingSchemaPresent.length === 0) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD COLUMN IF NOT EXISTS "previousPeriodStart" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const isBillingSchemaPresent = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingSubscription'`,
    );

    if (isBillingSchemaPresent.length === 0) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN IF EXISTS "previousPeriodStart"`,
    );
  }
}
