import { DataSource, QueryRunner } from 'typeorm';

import { isCoreTablePresent } from 'src/database/commands/upgrade-version-command/2-38/utils/is-core-table-present.util';
import { MakeBillingCreditGrantExpiresAtNullableFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-instance-command-fast-1788871259040-make-billing-credit-grant-expires-at-nullable';
import {
  getRegisteredInstanceCommandMetadata,
  RegisteredInstanceCommand,
} from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Converts the grants already on the ledger to the model the paired fast
// command opened the column for. Under the old one a live grant carried the end
// of its own period; the new settlement reads a deadline at or before the
// boundary it is closing as already spent, drops the grant and carries nothing
// forward. Every still-live legacy grant therefore has to give up its deadline,
// or the first period transition after this upgrade destroys the balances the
// change exists to protect.
//
// Until this runs, a workspace whose transition lands first loses the unspent
// part of its granted credits, so an upgrade that skips --include-slow should
// run this before the next billing cycle. Rows already expired are left alone:
// those are tombstones under both models, and clearing them would hand back
// credits that had genuinely lapsed.
@RegisteredInstanceCommand('2.40.0', 1788877128693, { type: 'slow' })
export class ConvertLiveCreditGrantsToNoExpirySlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    if (!(await isCoreTablePresent(dataSource, 'billingCreditGrant'))) {
      return;
    }

    // Bounded by when the column became nullable, because a grant written after
    // that came from the new code: its future deadline is an operator's
    // time-boxed grant, not a period end the old model stamped, and clearing it
    // would make those credits permanent. Falling back to now() when the fast
    // command left no record converts those few too, which costs a grant that
    // outlives its window rather than a workspace that loses paid-for credits.
    await dataSource.query(
      `UPDATE "core"."billingCreditGrant"
       SET "expiresAt" = NULL
       WHERE "revokedAt" IS NULL
         AND "expiresAt" > now()
         AND "createdAt" <= COALESCE(
           (SELECT "createdAt" FROM "core"."upgradeMigration"
             WHERE "workspaceId" IS NULL
               AND name = $1
               AND status = 'completed'
             ORDER BY "createdAt" DESC
             LIMIT 1),
           now()
         )`,
      [buildColumnMadeNullableCommandName()],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  // The column is left nullable by the paired fast command, so there is no
  // schema state to undo here and no date to invent for the rows cleared above.
  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}

// Mirrors how the runner records a command it has run. Derived from the class
// rather than written out, so renaming or re-timestamping the fast command
// cannot silently turn the bound above into now().
const buildColumnMadeNullableCommandName = (): string => {
  const { name } = MakeBillingCreditGrantExpiresAtNullableFastInstanceCommand;
  const metadata = getRegisteredInstanceCommandMetadata(
    MakeBillingCreditGrantExpiresAtNullableFastInstanceCommand,
  );

  return `${metadata?.version}_${name}_${metadata?.timestamp}`;
};
