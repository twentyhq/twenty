import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.50.0', 1792410699010)
export class AddPeriodMaxSeatsToBillingSubscriptionFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const billingSubscriptionTables = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingSubscription'`,
    );

    if (billingSubscriptionTables.length === 0) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD COLUMN IF NOT EXISTS "currentPeriodMaxSeats" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD COLUMN IF NOT EXISTS "previousPeriodMaxSeats" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const billingSubscriptionTables = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingSubscription'`,
    );

    if (billingSubscriptionTables.length === 0) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN IF EXISTS "previousPeriodMaxSeats"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN IF EXISTS "currentPeriodMaxSeats"`,
    );
  }
}
