import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// An expiry is now written when a grant is settled rather than when it is
// created, so credits no longer carry a deadline that a period transition has
// to run for them to survive.
//
// Rows already on the ledger also have to be converted, which the paired slow
// command does: this one only permits the null. See that command for why the
// conversion matters and what an upgrade that skips it leaves behind.
//
// down() cannot restore the column without inventing a date, so it stamps any
// row still holding a null with the instant of the rollback. That is the same
// tombstone the settlement would have written, and it keeps the balance out of
// the workspace rather than granting it indefinitely.
@RegisteredInstanceCommand('2.40.0', 1788871259040)
export class MakeBillingCreditGrantExpiresAtNullableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await isBillingCreditGrantPresent(queryRunner))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingCreditGrant" ALTER COLUMN "expiresAt" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await isBillingCreditGrantPresent(queryRunner))) {
      return;
    }

    await queryRunner.query(
      `UPDATE "core"."billingCreditGrant" SET "expiresAt" = now() WHERE "expiresAt" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."billingCreditGrant" ALTER COLUMN "expiresAt" SET NOT NULL`,
    );
  }
}

// The table only exists where billing is enabled, and the upgrade has to run
// on the instances where it does not.
const isBillingCreditGrantPresent = async (
  queryRunner: QueryRunner,
): Promise<boolean> => {
  const rows = await queryRunner.query(
    `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingCreditGrant'`,
  );

  return rows.length > 0;
};
