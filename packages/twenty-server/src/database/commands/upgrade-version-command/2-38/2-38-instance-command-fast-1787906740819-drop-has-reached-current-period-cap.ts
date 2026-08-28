import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// The GraphQL field of the same name is derived from the live credit balance in
// BillingSubscriptionItemResolver; the column has been neither read nor written
// since 2.32 and was only kept so a rollback to 2.31 still ran.
@RegisteredInstanceCommand('2.38.0', 1787906740819)
export class DropHasReachedCurrentPeriodCapFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await isBillingSubscriptionItemTablePresent(queryRunner))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP COLUMN IF EXISTS "hasReachedCurrentPeriodCap"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await isBillingSubscriptionItemTablePresent(queryRunner))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD COLUMN IF NOT EXISTS "hasReachedCurrentPeriodCap" boolean NOT NULL DEFAULT false`,
    );
  }
}

// An instance without billing never grew the table, and DROP COLUMN IF EXISTS
// still fails when the table itself is missing.
const isBillingSubscriptionItemTablePresent = async (
  queryRunner: QueryRunner,
): Promise<boolean> => {
  const rows = await queryRunner.query(
    `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingSubscriptionItem'`,
  );

  return rows.length > 0;
};
