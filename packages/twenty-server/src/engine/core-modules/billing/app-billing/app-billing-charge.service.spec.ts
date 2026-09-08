import { type Repository } from 'typeorm';

import { AppBillingChargeService } from 'src/engine/core-modules/billing/app-billing/app-billing-charge.service';
import { type BillingAppChargeEntity } from 'src/engine/core-modules/billing/entities/billing-app-charge.entity';
import { type ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { type UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { type BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

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

const params = {
  workspaceId: 'workspace-1',
  applicationId: 'app-1',
  charge: {
    idempotencyKey: 'recording-1',
    quantity: 2,
    creditsUsedMicro: 100,
    operationType: UsageOperationType.CALL_RECORDING,
  },
};

const setup = () => {
  const receipts = new Map<string, BillingAppChargeEntity>();
  const key = (value: {
    workspaceId: string;
    applicationId: string;
    idempotencyKey: string;
  }) =>
    JSON.stringify([
      value.workspaceId,
      value.applicationId,
      value.idempotencyKey,
    ]);
  const repository = {
    findOneBy: jest.fn(async (where) => receipts.get(key(where)) ?? null),
    findOneByOrFail: jest.fn(async (where) => receipts.get(key(where))),
    find: jest.fn(async () =>
      [...receipts.values()].filter((receipt) => !receipt.deliveredAt),
    ),
    update: jest.fn(async ({ id }, update) => {
      const receipt = [...receipts.values()].find(
        (receipt) => receipt.id === id,
      );
      Object.assign(receipt ?? {}, update);
      return { affected: receipt ? 1 : 0 };
    }),
    createQueryBuilder: () => {
      let values: BillingAppChargeEntity;
      let usageRow: Record<string, unknown>;
      const builder = {
        insert: () => builder,
        values: (input: BillingAppChargeEntity) => {
          values = input;
          return builder;
        },
        setParameter: (_name: string, input: string) => {
          usageRow = JSON.parse(input);
          return builder;
        },
        orIgnore: () => builder,
        execute: async () => {
          if (!receipts.has(key(values)))
            receipts.set(key(values), { ...values, usageRow });
        },
      };
      return builder;
    },
  };
  const usage = {
    prepareEvents: jest.fn(async (_workspaceId, events) =>
      events.map((event: object) => ({
        ...event,
        periodStart: new Date('2026-09-01') as Date | undefined,
      })),
    ),
  };
  const clickHouse = {
    getMainClient: jest.fn(() => ({})),
    insert: jest.fn().mockResolvedValue({ success: true }),
  };
  const cache = {
    flushAvailableCredits: jest.fn().mockResolvedValue(undefined),
  };
  const config = { get: jest.fn(() => true) };
  const service = new AppBillingChargeService(
    repository as unknown as Repository<BillingAppChargeEntity>,
    usage as unknown as UsageRecorderService,
    clickHouse as unknown as ClickHouseService,
    config as unknown as TwentyConfigService,
    cache as unknown as BillingUsageCacheService,
    {
      withLock: async (action: () => Promise<void>) => action(),
    } as unknown as CacheLockService,
  );
  return { receipts, repository, usage, clickHouse, cache, config, service };
};

it('acknowledges one immutable receipt for concurrent requests and later retries', async () => {
  const { receipts, service } = setup();
  const [first, second] = await Promise.all([
    service.accept(params),
    service.accept(params),
  ]);
  expect(first).toEqual(second);
  expect(receipts.size).toBe(1);
  expect(
    await service.accept({ ...params, userWorkspaceId: 'retrying-user' }),
  ).toEqual(first);
});

it('rejects reuse with a changed charge, while keeping keys scoped to the application and workspace', async () => {
  const { service, receipts } = setup();
  await service.accept(params);
  await expect(
    service.accept({
      ...params,
      charge: { ...params.charge, creditsUsedMicro: 200 },
    }),
  ).rejects.toThrow('different charge');
  await service.accept({ ...params, workspaceId: 'workspace-2' });
  await service.accept({ ...params, applicationId: 'app-2' });
  expect(receipts.size).toBe(3);
});

it('retains a failed delivery and retries the same receipt, period and amount', async () => {
  const { service, receipts, clickHouse } = setup();
  await service.accept(params);
  clickHouse.insert.mockResolvedValueOnce({
    success: false,
    error: { message: 'temporarily unavailable' },
  });
  await service.deliverPending();
  expect([...receipts.values()][0].deliveredAt).toBeUndefined();
  await service.deliverPending();
  expect(clickHouse.insert.mock.calls[1]).toEqual(
    clickHouse.insert.mock.calls[0],
  );
  expect([...receipts.values()][0].deliveredAt).toBeInstanceOf(Date);
});

it('retries delivery after a lost acknowledgement without creating a second receipt', async () => {
  const { service, receipts, clickHouse, repository } = setup();
  await service.accept(params);
  repository.update
    .mockImplementationOnce(async () => ({ affected: 1 }))
    .mockRejectedValueOnce(new Error('database unavailable'));
  await service.deliverPending();
  await service.deliverPending();
  expect(clickHouse.insert.mock.calls[1]).toEqual(
    clickHouse.insert.mock.calls[0],
  );
  expect(receipts.size).toBe(1);
});

it('keeps receipts pending while usage storage is unavailable or billing is disabled', async () => {
  const { service, repository, clickHouse, config } = setup();
  clickHouse.getMainClient.mockReturnValue(undefined as unknown as object);
  await service.deliverPending();
  expect(repository.find).not.toHaveBeenCalled();
  clickHouse.getMainClient.mockReturnValue({});
  config.get.mockReturnValue(false);
  await service.deliverPending();
  expect(repository.find).not.toHaveBeenCalled();
});

it('continues delivering other receipts when claiming one fails', async () => {
  const { service, repository, clickHouse } = setup();
  await service.accept(params);
  await service.accept({
    ...params,
    charge: { ...params.charge, idempotencyKey: 'recording-2' },
  });
  repository.update.mockRejectedValueOnce(new Error('claim unavailable'));
  await service.deliverPending();
  expect(clickHouse.insert).toHaveBeenCalledTimes(1);
});

it('does not acknowledge usage without a billing period, so the app can retry after subscription recovery', async () => {
  const { service, usage, receipts } = setup();
  usage.prepareEvents.mockResolvedValueOnce([
    { ...params.charge, periodStart: undefined },
  ]);
  await expect(service.accept(params)).rejects.toThrow(
    'billing period is not available',
  );
  expect(receipts.size).toBe(0);
  await expect(service.accept(params)).resolves.toMatchObject({
    status: 'accepted',
  });
});
