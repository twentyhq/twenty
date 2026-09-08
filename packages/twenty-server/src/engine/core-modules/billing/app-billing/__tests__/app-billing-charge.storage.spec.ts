import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';
import { join } from 'path';

import { createClient } from '@clickhouse/client';
import { DataSource, Entity, PrimaryColumn } from 'typeorm';

import { CreateBillingAppChargeFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-instance-command-fast-1788862666171-create-billing-app-charge';
import { type ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { AppBillingChargeService } from 'src/engine/core-modules/billing/app-billing/app-billing-charge.service';
import { BillingAppChargeEntity } from 'src/engine/core-modules/billing/entities/billing-app-charge.entity';
import { type BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

jest.mock('src/database/clickhouse/clickhouse.service', () => ({
  ClickHouseService: class {},
}));
jest.mock(
  'src/engine/core-modules/usage/services/usage-recorder.service',
  () => ({ UsageRecorderService: class {} }),
);
jest.mock(
  'src/engine/core-modules/billing/services/billing-usage-cache.service',
  () => ({ BillingUsageCacheService: class {} }),
);
jest.mock(
  'src/engine/core-modules/twenty-config/twenty-config.service',
  () => ({ TwentyConfigService: class {} }),
);

@Entity({ name: 'workspace', schema: 'core' })
class WorkspaceEntity {
  @PrimaryColumn('uuid')
  id: string;
}

// Both URLs must point to disposable development services; each run creates its own database.
const postgresUrl = process.env.APP_BILLING_TEST_POSTGRES_URL;
const clickHouseUrl = process.env.APP_BILLING_TEST_CLICKHOUSE_URL;
const storageTests = postgresUrl && clickHouseUrl ? describe : describe.skip;

storageTests('durable app billing storage', () => {
  const database = `app_billing_test_${randomUUID().replace(/-/g, '')}`;
  const workspaceId = randomUUID();
  const applicationId = randomUUID();
  const periodStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const postgresAdmin = new DataSource({ type: 'postgres', url: postgresUrl });
  const testUrl = new URL(postgresUrl ?? 'postgres://localhost/postgres');
  testUrl.pathname = `/${database}`;
  const postgres = new DataSource({
    type: 'postgres',
    url: testUrl.toString(),
    entities: [BillingAppChargeEntity, WorkspaceEntity],
  });
  const clickHouseAdmin = createClient({ url: clickHouseUrl });
  const clickHouse = createClient({ url: clickHouseUrl, database });
  const migration = new CreateBillingAppChargeFastInstanceCommand();
  const params = {
    workspaceId,
    applicationId,
    charge: {
      idempotencyKey: 'recording-1',
      quantity: 2,
      creditsUsedMicro: 200,
      operationType: UsageOperationType.CALL_RECORDING,
    },
  };

  beforeAll(async () => {
    jest.useRealTimers();
    await postgresAdmin.initialize();
    await postgresAdmin.query(`CREATE DATABASE "${database}"`);
    await postgres.initialize();
    await postgres.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await postgres.query('CREATE SCHEMA core');
    await postgres.query('CREATE TABLE core.workspace (id uuid PRIMARY KEY)');
    await postgres.query(
      'CREATE TABLE core."billingCustomer" (id uuid PRIMARY KEY)',
    );
    await postgres.query('INSERT INTO core.workspace VALUES ($1)', [
      workspaceId,
    ]);
    const runner = postgres.createQueryRunner();
    try {
      await migration.up(runner);
    } finally {
      await runner.release();
    }
    await clickHouseAdmin.command({ query: `CREATE DATABASE ${database}` });
    for (const file of [
      '004-create-usage-event-table.sql',
      '006-update-usage-event-table.sql',
      '007-add-spender-columns-to-usage-event.sql',
      '008-create-idempotent-app-usage.sql',
    ]) {
      const sql = await readFile(
        join(process.cwd(), 'src/database/clickhouse/migrations', file),
        'utf8',
      );
      for (const query of sql
        .split(';')
        .map((statement) => statement.trim())
        .filter(Boolean)) {
        await clickHouse.command({ query });
      }
    }
  }, 30_000);

  afterAll(async () => {
    if (postgres.isInitialized) await postgres.destroy();
    if (postgresAdmin.isInitialized) {
      await postgresAdmin.query(`DROP DATABASE IF EXISTS "${database}"`);
      await postgresAdmin.destroy();
    }
    await clickHouse.close();
    await clickHouseAdmin.command({
      query: `DROP DATABASE IF EXISTS ${database}`,
    });
    await clickHouseAdmin.close();
  });

  const service = () =>
    new AppBillingChargeService(
      postgres.getRepository(BillingAppChargeEntity),
      {
        prepareEvents: async (_workspace: string, events: RecordUsageInput[]) =>
          events.map((event) => ({ ...event, periodStart })),
      } as unknown as UsageRecorderService,
      {
        getMainClient: () => clickHouse,
        insert: async (table: string, values: Record<string, unknown>[]) => {
          await clickHouse.insert({ table, values, format: 'JSONEachRow' });
          return { success: true };
        },
      } as unknown as ClickHouseService,
      { get: () => true } as unknown as TwentyConfigService,
      {
        flushAvailableCredits: async () => {},
      } as unknown as BillingUsageCacheService,
      {
        withLock: async (action: () => Promise<void>) => action(),
      } as unknown as CacheLockService,
    );

  it('uses the database unique constraint for simultaneous acceptance and rejects conflicting retries', async () => {
    const billing = service();
    const results = await Promise.all(
      Array.from({ length: 20 }, () => billing.accept(params)),
    );
    expect(new Set(results.map((result) => result.receiptId)).size).toBe(1);
    const repository = postgres.getRepository(BillingAppChargeEntity);
    expect(await repository.count()).toBe(1);
    const receipt = await repository.findOneByOrFail({
      id: results[0].receiptId,
    });
    expect(receipt.usageRow).toMatchObject({
      workspaceId,
      applicationId,
      creditsUsedMicro: 200,
    });
    await expect(
      billing.accept({
        ...params,
        charge: { ...params.charge, creditsUsedMicro: 300 },
      }),
    ).rejects.toThrow('different charge');
    expect(await repository.count()).toBe(1);
  });

  it('counts an acknowledged-lost delivery once, including before ClickHouse merges', async () => {
    const repository = postgres.getRepository(BillingAppChargeEntity);
    const billing = service();
    const { receiptId } = await billing.accept(params);
    const originalUpdate = repository.update.bind(repository);
    const update = jest
      .spyOn(repository, 'update')
      .mockImplementation(async (criteria, partial) => {
        if ('deliveredAt' in partial)
          throw new Error('lost database acknowledgement');
        return originalUpdate(criteria, partial);
      });
    await clickHouse.command({ query: 'SYSTEM STOP MERGES appUsageEvent' });
    try {
      await billing.deliverPending();
      update.mockRestore();
      expect(
        (await repository.findOneByOrFail({ id: receiptId })).deliveredAt,
      ).toBeNull();
      await repository.update(
        { id: receiptId },
        { nextAttemptAt: new Date(0) },
      );
      await billing.deliverPending();
      const receipt = await repository.findOneByOrFail({ id: receiptId });
      expect(receipt.deliveredAt).toBeInstanceOf(Date);
      await clickHouse.insert({
        table: 'usageEvent',
        values: [{ ...receipt.usageRow, creditsUsedMicro: 100 }],
        format: 'JSONEachRow',
      });
      const raw = await clickHouse.query({
        query: 'SELECT count() AS count FROM appUsageEvent',
        format: 'JSONEachRow',
      });
      expect(await raw.json()).toEqual([{ count: 2 }]);
      const billable = await clickHouse.query({
        query:
          'SELECT sum(creditsUsedMicro) AS total, count() AS count FROM billableUsageEvent WHERE workspaceId = {workspaceId:String} AND applicationId = {applicationId:String} GROUP BY periodStart',
        query_params: { workspaceId, applicationId },
        format: 'JSONEachRow',
      });
      expect(await billable.json()).toEqual([{ total: 300, count: 2 }]);
    } finally {
      update.mockRestore();
      await clickHouse.command({ query: 'SYSTEM START MERGES appUsageEvent' });
    }
  });

  it('reverses the actual Postgres migration and tolerates a billing-disabled schema', async () => {
    const runner = postgres.createQueryRunner();
    try {
      await migration.down(runner);
      expect(await runner.hasTable('core.billingAppCharge')).toBe(false);
      await runner.query('DROP TABLE core."billingCustomer"');
      await migration.up(runner);
      expect(await runner.hasTable('core.billingAppCharge')).toBe(false);
      await migration.down(runner);
    } finally {
      await runner.release();
    }
  });
});
