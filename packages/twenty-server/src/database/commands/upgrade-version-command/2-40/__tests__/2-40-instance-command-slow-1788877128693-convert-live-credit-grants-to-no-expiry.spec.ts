import { type DataSource } from 'typeorm';

import { MakeBillingCreditGrantExpiresAtNullableFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-instance-command-fast-1788871259040-make-billing-credit-grant-expires-at-nullable';
import { ConvertLiveCreditGrantsToNoExpirySlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-instance-command-slow-1788877128693-convert-live-credit-grants-to-no-expiry';
import { getRegisteredInstanceCommandMetadata } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';

const buildFakeDataSource = ({
  hasBillingCreditGrantTable,
}: {
  hasBillingCreditGrantTable: boolean;
}): {
  dataSource: DataSource;
  queries: { sql: string; params?: unknown[] }[];
} => {
  const queries: { sql: string; params?: unknown[] }[] = [];

  const dataSource = {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      queries.push({ sql, params });

      if (sql.includes('pg_tables')) {
        return hasBillingCreditGrantTable ? [{ '?column?': 1 }] : [];
      }

      return [];
    }),
  } as unknown as DataSource;

  return { dataSource, queries };
};

describe('ConvertLiveCreditGrantsToNoExpirySlowInstanceCommand', () => {
  it('leaves an instance without billing alone', async () => {
    const { dataSource, queries } = buildFakeDataSource({
      hasBillingCreditGrantTable: false,
    });

    await new ConvertLiveCreditGrantsToNoExpirySlowInstanceCommand().runDataMigration(
      dataSource,
    );

    expect(queries).toHaveLength(1);
    expect(queries[0].sql).toContain('pg_tables');
  });

  it('only clears deadlines the old model stamped', async () => {
    const { dataSource, queries } = buildFakeDataSource({
      hasBillingCreditGrantTable: true,
    });

    await new ConvertLiveCreditGrantsToNoExpirySlowInstanceCommand().runDataMigration(
      dataSource,
    );

    const update = queries.find(({ sql }) => sql.startsWith('UPDATE'));

    expect(update?.sql).toContain('"revokedAt" IS NULL');
    expect(update?.sql).toContain('"expiresAt" > now()');
    expect(update?.sql).toContain('"createdAt" <=');
  });

  // The bound is a lookup by name into the runner's own record of the paired
  // fast command. Nothing else ties the two together, and a name that no longer
  // matches silently converts the operator-set deadlines this bound exists to
  // protect.
  it('asks for the paired fast command under the name the runner records it as', async () => {
    const { dataSource, queries } = buildFakeDataSource({
      hasBillingCreditGrantTable: true,
    });

    await new ConvertLiveCreditGrantsToNoExpirySlowInstanceCommand().runDataMigration(
      dataSource,
    );

    const metadata = getRegisteredInstanceCommandMetadata(
      MakeBillingCreditGrantExpiresAtNullableFastInstanceCommand,
    );
    const update = queries.find(({ sql }) => sql.startsWith('UPDATE'));

    expect(update?.params).toEqual([
      `${metadata?.version}_${MakeBillingCreditGrantExpiresAtNullableFastInstanceCommand.name}_${metadata?.timestamp}`,
    ]);
    expect(update?.params?.[0]).toBe(
      '2.40.0_MakeBillingCreditGrantExpiresAtNullableFastInstanceCommand_1788871259040',
    );
  });
});
