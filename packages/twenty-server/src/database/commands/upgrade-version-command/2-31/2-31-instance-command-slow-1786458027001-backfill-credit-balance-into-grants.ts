import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const BACKFILL_IDEMPOTENCY_KEY_PREFIX = 'backfill-credit-balance:';

// Turns the single billingCustomer.creditBalanceMicro number into one grant per
// workspace. Until this runs, BillingCreditGrantService falls back to the
// mirror column for workspaces that have no grant yet, so credit balances stay
// correct whether or not the upgrade was invoked with --include-slow.
//
// The column keeps being written as a mirror of the ledger until it is dropped
// in a later release, so this stays reversible.
@RegisteredInstanceCommand('2.31.0', 1786458027001, { type: 'slow' })
export class BackfillCreditBalanceIntoGrantsSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    // Nothing to move on an instance without billing: neither the ledger nor
    // the column it mirrors exists there.
    const presentTables = await dataSource.query(
      `SELECT tablename FROM pg_tables
        WHERE schemaname = 'core'
          AND tablename IN ('billingCreditGrant', 'billingCustomer', 'billingSubscription')`,
    );

    const presentTableNames = new Set(
      presentTables.map((row: { tablename: string }) => row.tablename),
    );

    if (
      !presentTableNames.has('billingCreditGrant') ||
      !presentTableNames.has('billingCustomer') ||
      !presentTableNames.has('billingSubscription')
    ) {
      return;
    }

    // Expiry follows the workspace's current period, but never lands in the
    // past: a backfilled grant that expires on creation would silently delete
    // the balance it was meant to preserve.
    await dataSource.query(
      `INSERT INTO "core"."billingCreditGrant" (
        "workspaceId", "amountMicro", "type", "effectiveAt", "expiresAt", "reason", "idempotencyKey"
      )
      SELECT
        "billingCustomer"."workspaceId",
        "billingCustomer"."creditBalanceMicro",
        'ROLLOVER',
        now(),
        GREATEST(
          COALESCE(
            (
              SELECT "billingSubscription"."currentPeriodEnd"
              FROM "core"."billingSubscription"
              WHERE "billingSubscription"."workspaceId" = "billingCustomer"."workspaceId"
                AND "billingSubscription"."status" <> 'canceled'
              ORDER BY "billingSubscription"."currentPeriodEnd" DESC
              LIMIT 1
            ),
            now()
          ),
          now() + interval '1 day'
        ),
        'Backfilled from billingCustomer.creditBalanceMicro',
        $1 || "billingCustomer"."workspaceId"
      FROM "core"."billingCustomer"
      WHERE "billingCustomer"."creditBalanceMicro" > 0
      ON CONFLICT ("idempotencyKey") DO NOTHING`,
      [BACKFILL_IDEMPOTENCY_KEY_PREFIX],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // An instance without billing never grew the table, so deleting from it
    // unconditionally would fail the rollback on exactly the instances that
    // had nothing to roll back.
    const isLedgerPresent = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingCreditGrant'`,
    );

    if (isLedgerPresent.length === 0) {
      return;
    }

    await queryRunner.query(
      `DELETE FROM "core"."billingCreditGrant" WHERE "idempotencyKey" LIKE $1`,
      [`${BACKFILL_IDEMPOTENCY_KEY_PREFIX}%`],
    );
  }
}
