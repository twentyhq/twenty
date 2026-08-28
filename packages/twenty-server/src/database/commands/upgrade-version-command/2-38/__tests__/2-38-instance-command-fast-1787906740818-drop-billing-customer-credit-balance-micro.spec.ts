import { type QueryRunner } from 'typeorm';

import { DropBillingCustomerCreditBalanceMicroFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-instance-command-fast-1787906740818-drop-billing-customer-credit-balance-micro';

const collapseWhitespace = (statement: string): string =>
  statement.replace(/\s+/g, ' ').trim();

describe('DropBillingCustomerCreditBalanceMicroFastInstanceCommand', () => {
  const query = jest.fn();
  const queryRunner = { query } as unknown as QueryRunner;
  const command = new DropBillingCustomerCreditBalanceMicroFastInstanceCommand();

  const presentTables = (...tableNames: string[]) => {
    query.mockImplementation((statement: string, parameters?: unknown[]) => {
      if (!statement.includes('pg_tables')) {
        return Promise.resolve(undefined);
      }

      return Promise.resolve(
        tableNames.includes(String(parameters?.[0])) ? [{ '?column?': 1 }] : [],
      );
    });
  };

  const statements = (): string[] =>
    query.mock.calls
      .map(([statement]) => collapseWhitespace(statement))
      .filter((statement) => !statement.includes('pg_tables'));

  beforeEach(() => {
    query.mockReset();
  });

  it('drops the mirror column', async () => {
    presentTables('billingCustomer', 'billingCreditGrant');

    await command.up(queryRunner);

    expect(statements()).toEqual([
      'ALTER TABLE "core"."billingCustomer" DROP COLUMN IF EXISTS "creditBalanceMicro"',
    ]);
  });

  it('leaves an instance without billing alone', async () => {
    presentTables();

    await command.up(queryRunner);
    await command.down(queryRunner);

    expect(statements()).toEqual([]);
  });

  it('restores the column and rebuilds it from the ledger', async () => {
    presentTables('billingCustomer', 'billingCreditGrant');

    await command.down(queryRunner);

    const [addColumn, rebuild] = statements();

    expect(addColumn).toBe(
      'ALTER TABLE "core"."billingCustomer" ADD COLUMN IF NOT EXISTS "creditBalanceMicro" bigint NOT NULL DEFAULT 0',
    );
    expect(rebuild).toContain('UPDATE "core"."billingCustomer"');
    expect(rebuild).toContain('SUM("billingCreditGrant"."amountMicro")');
  });

  // The rebuild has to keep counting exactly what getActiveCreditsMicro counts,
  // or a rollback hands out credits that were revoked or already expired.
  it('rebuilds from the same grants getActiveCreditsMicro reads', async () => {
    presentTables('billingCustomer', 'billingCreditGrant');

    await command.down(queryRunner);

    const [, rebuild] = statements();

    expect(rebuild).toContain('"billingCreditGrant"."revokedAt" IS NULL');
    expect(rebuild).toContain('"billingCreditGrant"."effectiveAt" <= now()');
    expect(rebuild).toContain('"billingCreditGrant"."expiresAt" > now()');
    expect(rebuild).toContain('COALESCE(');
  });

  // Restoring the column is still right without a ledger to rebuild from; only
  // the backfill has to be skipped.
  it('restores the column without rebuilding when the ledger is absent', async () => {
    presentTables('billingCustomer');

    await command.down(queryRunner);

    expect(statements()).toEqual([
      'ALTER TABLE "core"."billingCustomer" ADD COLUMN IF NOT EXISTS "creditBalanceMicro" bigint NOT NULL DEFAULT 0',
    ]);
  });
});
