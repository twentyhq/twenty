import { ApplicationKeyValuePersistenceJob } from 'src/engine/core-modules/application/application-key-value/application-key-value-persistence.job';
import { randomUUID } from 'crypto';
import { DataSource, EntitySchema, type Repository } from 'typeorm';

import { ApplicationKeyValueService } from 'src/engine/core-modules/application/application-key-value/services/application-key-value.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

jest.mock('src/engine/core-modules/application/application.entity', () => ({
  ApplicationEntity: class {},
}));
jest.mock(
  'src/engine/core-modules/application/application-registration/application-registration.entity',
  () => ({ ApplicationRegistrationEntity: class {} }),
);
jest.mock(
  'src/engine/core-modules/key-value-pair/key-value-pair.entity',
  () => ({
    KeyValuePairEntity: class {},
    KeyValuePairType: { APPLICATION_VARIABLE: 'APPLICATION_VARIABLE' },
  }),
);

it('returns the insert winner and never overwrites another worker claim', async () => {
  const entries = new Map<string, object>();
  const repository = {
    createQueryBuilder: () => {
      let value: { key: string; applicationId: string; workspaceId: string };
      const builder = {
        insert: () => builder,
        values: (input: typeof value) => {
          value = input;
          return builder;
        },
        orIgnore: () => builder,
        returning: () => builder,
        execute: async () => {
          const key = `${value.applicationId}:${value.key}`;
          if (entries.has(key)) return { raw: [] };
          entries.set(key, value);
          return { raw: [{ id: 'inserted' }] };
        },
      };
      return builder;
    },
  };
  const service = new ApplicationKeyValueService(
    repository as unknown as Repository<KeyValuePairEntity>,
    {} as Repository<ApplicationEntity>,
    {} as Repository<ApplicationRegistrationEntity>,
  );
  const input = {
    application: { id: 'app-1' } as FlatApplication,
    workspaceId: 'workspace-1',
    key: 'summary-1',
    value: { status: 'RUNNING' },
  };
  const results = await Promise.all([
    service.setIfAbsent(input),
    service.setIfAbsent({ ...input, value: { status: 'FORGED' } }),
  ]);
  expect(results).toEqual([true, false]);
  expect([...entries.values()]).toEqual([
    expect.objectContaining({
      value: { status: 'RUNNING' },
      applicationId: 'app-1',
      workspaceId: 'workspace-1',
      userId: null,
      type: 'APPLICATION_VARIABLE',
    }),
  ]);
  expect(
    await service.setIfAbsent({
      ...input,
      application: { id: 'app-2' } as FlatApplication,
    }),
  ).toBe(true);
});

const postgresUrl = process.env.APP_BILLING_TEST_POSTGRES_URL;
const storageTests = postgresUrl ? describe : describe.skip;

storageTests('atomic application claims in PostgreSQL', () => {
  const database = `application_claim_test_${randomUUID().replace(/-/g, '')}`;
  const admin = new DataSource({ type: 'postgres', url: postgresUrl });
  const url = new URL(postgresUrl ?? 'postgres://localhost/postgres');
  url.pathname = `/${database}`;
  const schema = new EntitySchema<KeyValuePairEntity>({
    name: 'keyValuePair',
    columns: {
      id: { type: 'uuid', primary: true, generated: 'uuid' },
      key: { type: 'text' },
      applicationId: { type: 'uuid', nullable: true },
      workspaceId: { type: 'uuid', nullable: true },
      userId: { type: 'uuid', nullable: true },
      value: { type: 'jsonb', nullable: true },
      type: { type: 'text' },
    },
    indices: [
      {
        name: 'IDX_KEY_VALUE_PAIR_KEY_APPLICATION_ID_WORKSPACE_UNIQUE',
        columns: ['key', 'applicationId'],
        unique: true,
        where: '"applicationId" IS NOT NULL AND "workspaceId" IS NOT NULL',
      },
    ],
  });
  const databaseConnection = new DataSource({
    type: 'postgres',
    url: url.toString(),
    entities: [schema],
    synchronize: true,
  });
  beforeAll(async () => {
    jest.useRealTimers();
    await admin.initialize();
    await admin.query(`CREATE DATABASE "${database}"`);
    await databaseConnection.initialize();
  });
  afterAll(async () => {
    if (databaseConnection.isInitialized) await databaseConnection.destroy();
    if (admin.isInitialized) {
      await admin.query(`DROP DATABASE IF EXISTS "${database}"`);
      await admin.destroy();
    }
  });

  it('grants one of twenty concurrent claims and retains the winning value', async () => {
    const repository = databaseConnection.getRepository(schema);
    const service = new ApplicationKeyValueService(
      repository,
      {} as Repository<ApplicationEntity>,
      {} as Repository<ApplicationRegistrationEntity>,
    );
    const application = { id: randomUUID() } as FlatApplication;
    const workspaceId = randomUUID();
    const attempts = Array.from({ length: 20 }, (_, worker) => ({
      application,
      workspaceId,
      key: 'summary',
      value: { worker },
    }));
    const results = await Promise.all(
      attempts.map((input) => service.setIfAbsent(input)),
    );
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await repository.count()).toBe(1);
    const winner = await repository.findOneByOrFail({
      key: 'summary',
      applicationId: application.id,
    });
    expect(winner.value).toEqual(attempts[results.indexOf(true)].value);
    expect(
      await service.setIfAbsent({
        ...attempts[0],
        application: { id: randomUUID() } as FlatApplication,
      }),
    ).toBe(true);
    expect(await repository.count()).toBe(2);
  });
  it('replays queued persistence into PostgreSQL without duplicating the result', async () => {
    const repository = databaseConnection.getRepository(schema);
    const service = new ApplicationKeyValueService(
      repository,
      {} as Repository<ApplicationEntity>,
      {} as Repository<ApplicationRegistrationEntity>,
    );
    const data = {
      applicationId: randomUUID(),
      workspaceId: randomUUID(),
      key: 'queued-result',
      value: { status: 'READY', markdown: 'Paid result' },
    };
    await service.setIfAbsent({
      application: { id: data.applicationId } as FlatApplication,
      ...data,
      value: { status: 'RUNNING' },
    });
    const job = new ApplicationKeyValuePersistenceJob(service);
    await job.handle(data);
    await job.handle(data);
    const entries = await repository.findBy({
      applicationId: data.applicationId,
      key: data.key,
    });
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject(data);
  });
});
