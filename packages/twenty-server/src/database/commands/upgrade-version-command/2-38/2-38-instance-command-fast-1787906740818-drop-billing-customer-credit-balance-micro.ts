import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Second phase of the move to the billingCreditGrant ledger: the column was
// kept as a mirror of the ledger so a rollback to a pre-2.31 release stayed a
// deploy. The 2.31 backfill runs earlier in the sequence than this drop, so
// balances are in the ledger by the time the column goes.
@RegisteredInstanceCommand('2.38.0', 1787906740818)
export class DropBillingCustomerCreditBalanceMicroFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await isBillingCustomerTablePresent(queryRunner))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP COLUMN IF EXISTS "creditBalanceMicro"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await isBillingCustomerTablePresent(queryRunner))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD COLUMN IF NOT EXISTS "creditBalanceMicro" bigint NOT NULL DEFAULT 0`,
    );
  }
}

// An instance without billing never grew the table, and DROP COLUMN IF EXISTS
// still fails when the table itself is missing.
const isBillingCustomerTablePresent = async (
  queryRunner: QueryRunner,
): Promise<boolean> => {
  const rows = await queryRunner.query(
    `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingCustomer'`,
  );

  return rows.length > 0;
};
