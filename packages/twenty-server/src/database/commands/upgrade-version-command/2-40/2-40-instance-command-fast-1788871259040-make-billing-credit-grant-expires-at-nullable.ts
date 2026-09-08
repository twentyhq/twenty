import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// An expiry is now written when a grant is settled rather than when it is
// created, so credits no longer carry a deadline that a period transition has
// to run for them to survive.
//
// Rows already on the ledger have to be converted, not just permitted. Under
// the old model a live grant carried the end of its period, which the new
// settlement reads as a deadline that has already passed and therefore drops
// without carrying anything forward. Clearing the expiry on every still-live
// grant is what stops the first transition after this upgrade from destroying
// the balances the change exists to protect. Rows whose expiry is already in
// the past are left alone: those are tombstones under both models.
//
// down() cannot restore the column without inventing a date, so it stamps the
// rows it cleared with the instant of the rollback. That is the same tombstone
// the settlement would have written, and it keeps the balance out of the
// workspace rather than granting it indefinitely.
@RegisteredInstanceCommand('2.40.0', 1788871259040)
export class MakeBillingCreditGrantExpiresAtNullableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await isBillingCreditGrantPresent(queryRunner))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingCreditGrant" ALTER COLUMN "expiresAt" DROP NOT NULL`,
    );

    // Must land with the schema change: a nullable column whose live rows still
    // carry a period end is the state where the next settlement drops them.
    await queryRunner.query(
      `UPDATE "core"."billingCreditGrant" SET "expiresAt" = NULL WHERE "revokedAt" IS NULL AND "expiresAt" > now()`,
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
