import { QueryRunner } from 'typeorm';

import { isCoreTablePresent } from 'src/database/commands/upgrade-version-command/2-38/utils/is-core-table-present.util';
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
    if (!(await isCoreTablePresent(queryRunner, 'billingCustomer'))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP COLUMN IF EXISTS "creditBalanceMicro"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await isCoreTablePresent(queryRunner, 'billingCustomer'))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD COLUMN IF NOT EXISTS "creditBalanceMicro" bigint NOT NULL DEFAULT 0`,
    );
  }
}
