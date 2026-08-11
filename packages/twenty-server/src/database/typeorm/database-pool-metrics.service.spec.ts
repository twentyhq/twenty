import { type Pool } from 'pg';
import { type DataSource } from 'typeorm';
import { type PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';

import {
  DatabasePoolMetricsService,
  DatabasePoolName,
} from 'src/database/typeorm/database-pool-metrics.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

type GaugeCallback = () => Promise<
  Array<{
    value: number;
    attributes: {
      pool: DatabasePoolName;
    };
  }>
>;

const createDataSource = ({
  totalCount = 0,
  idleCount = 0,
  waitingCount = 0,
  max = 10,
  obtainMasterConnection = jest
    .fn()
    .mockResolvedValue([{}, jest.fn()] as [unknown, jest.Mock]),
}: {
  totalCount?: number;
  idleCount?: number;
  waitingCount?: number;
  max?: number;
  obtainMasterConnection?: jest.Mock;
} = {}) => {
  const pool = {
    totalCount,
    idleCount,
    waitingCount,
    options: {
      max,
    },
  } as Pool;
  const driver = {
    master: pool,
    obtainMasterConnection,
  } as unknown as PostgresDriver;
  const dataSource = {
    driver,
  } as unknown as DataSource;

  return {
    dataSource,
    driver,
    obtainMasterConnection,
  };
};

const createRawPool = ({ connectError }: { connectError?: Error } = {}) => {
  const client = { release: jest.fn() };
  const connect = jest.fn((callback?: (...args: unknown[]) => void) => {
    if (callback) {
      callback(connectError, connectError ? undefined : client, jest.fn());

      return undefined;
    }

    return connectError
      ? Promise.reject(connectError)
      : Promise.resolve(client);
  });

  const pool = {
    totalCount: 1,
    idleCount: 1,
    waitingCount: 0,
    options: { max: 10 },
    connect,
  } as unknown as Pool;

  return { pool, connect, client };
};

describe('DatabasePoolMetricsService', () => {
  let service: DatabasePoolMetricsService;
  let gaugeCallbacks: Map<string, GaugeCallback>;
  let histogramRecord: jest.Mock;
  let counterAdd: jest.Mock;
  let createCounter: jest.Mock;

  beforeEach(() => {
    gaugeCallbacks = new Map();
    histogramRecord = jest.fn();
    counterAdd = jest.fn();
    createCounter = jest.fn().mockReturnValue({
      add: counterAdd,
    });

    const metricsService = {
      getMeter: jest.fn().mockReturnValue({
        createHistogram: jest.fn().mockReturnValue({
          record: histogramRecord,
        }),
        createCounter,
      }),
      createMultiObservableGauge: jest
        .fn()
        .mockImplementation(({ metricName, callback }) => {
          gaugeCallbacks.set(metricName, callback);
        }),
    } as unknown as MetricsService;

    service = new DatabasePoolMetricsService(metricsService);
  });

  it('reports pool connection state for every registered data source', async () => {
    const core = createDataSource({
      totalCount: 10,
      idleCount: 3,
      waitingCount: 2,
      max: 10,
    });
    const workspace = createDataSource({
      totalCount: 8,
      idleCount: 5,
      waitingCount: 0,
      max: 12,
    });

    service.registerDataSource({
      poolName: DatabasePoolName.Core,
      dataSource: core.dataSource,
    });
    service.registerDataSource({
      poolName: DatabasePoolName.WorkspacePrimary,
      dataSource: workspace.dataSource,
    });

    await expect(
      gaugeCallbacks.get('twenty_database_pool_total_connections')?.(),
    ).resolves.toEqual([
      {
        value: 10,
        attributes: {
          pool: DatabasePoolName.Core,
        },
      },
      {
        value: 8,
        attributes: {
          pool: DatabasePoolName.WorkspacePrimary,
        },
      },
    ]);
    await expect(
      gaugeCallbacks.get('twenty_database_pool_idle_connections')?.(),
    ).resolves.toEqual([
      {
        value: 3,
        attributes: {
          pool: DatabasePoolName.Core,
        },
      },
      {
        value: 5,
        attributes: {
          pool: DatabasePoolName.WorkspacePrimary,
        },
      },
    ]);
    await expect(
      gaugeCallbacks.get('twenty_database_pool_waiting_requests')?.(),
    ).resolves.toEqual([
      {
        value: 2,
        attributes: {
          pool: DatabasePoolName.Core,
        },
      },
      {
        value: 0,
        attributes: {
          pool: DatabasePoolName.WorkspacePrimary,
        },
      },
    ]);
    await expect(
      gaugeCallbacks.get('twenty_database_pool_max_connections')?.(),
    ).resolves.toEqual([
      {
        value: 10,
        attributes: {
          pool: DatabasePoolName.Core,
        },
      },
      {
        value: 12,
        attributes: {
          pool: DatabasePoolName.WorkspacePrimary,
        },
      },
    ]);
  });

  it('records connection acquisition duration', async () => {
    const dataSource = createDataSource({
      obtainMasterConnection: jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));

        return [{}, jest.fn()];
      }),
    });

    service.registerDataSource({
      poolName: DatabasePoolName.WorkspacePrimary,
      dataSource: dataSource.dataSource,
    });

    const connectionPromise = dataSource.driver.obtainMasterConnection();

    await jest.advanceTimersByTimeAsync(250);
    await connectionPromise;

    expect(histogramRecord).toHaveBeenCalledWith(0.25, {
      pool: DatabasePoolName.WorkspacePrimary,
    });
    expect(counterAdd).not.toHaveBeenCalled();
  });

  it('records failed connection acquisitions', async () => {
    const error = new Error('connection failed');
    const dataSource = createDataSource({
      obtainMasterConnection: jest.fn().mockRejectedValue(error),
    });

    service.registerDataSource({
      poolName: DatabasePoolName.Core,
      dataSource: dataSource.dataSource,
    });

    await expect(dataSource.driver.obtainMasterConnection()).rejects.toBe(
      error,
    );
    expect(histogramRecord).toHaveBeenCalledWith(0, {
      pool: DatabasePoolName.Core,
    });
    expect(counterAdd).toHaveBeenCalledWith(1, {
      pool: DatabasePoolName.Core,
    });
    expect(createCounter).toHaveBeenCalledWith(
      'twenty_database_pool_acquisition_failures',
      {
        description: 'Number of failed PostgreSQL pool connection acquisitions',
      },
    );
  });

  it('does not instrument a data source more than once', async () => {
    const dataSource = createDataSource();

    service.registerDataSource({
      poolName: DatabasePoolName.Core,
      dataSource: dataSource.dataSource,
    });
    service.registerDataSource({
      poolName: DatabasePoolName.Core,
      dataSource: dataSource.dataSource,
    });

    await dataSource.driver.obtainMasterConnection();

    expect(dataSource.obtainMasterConnection).toHaveBeenCalledTimes(1);
    expect(histogramRecord).toHaveBeenCalledTimes(1);
  });

  // pool.query() acquires its client through the callback form, so instrumentation that
  // only handles the promise form leaves every pooled query hanging.
  it('keeps the callback form of connect working', () => {
    const { pool } = createRawPool();

    service.registerPool({
      poolName: DatabasePoolName.WorkspaceV2Primary,
      pool,
    });

    const onConnect = jest.fn();

    pool.connect(onConnect);

    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(histogramRecord).toHaveBeenCalledTimes(1);
  });

  it('keeps the promise form of connect working', async () => {
    const { pool, client } = createRawPool();

    service.registerPool({
      poolName: DatabasePoolName.WorkspaceV2Primary,
      pool,
    });

    await expect(pool.connect()).resolves.toBe(client);
    expect(histogramRecord).toHaveBeenCalledTimes(1);
  });

  it('counts a failed acquisition in both forms', async () => {
    const connectError = new Error('pool exhausted');
    const { pool } = createRawPool({ connectError });

    service.registerPool({
      poolName: DatabasePoolName.WorkspaceV2Primary,
      pool,
    });

    await expect(pool.connect()).rejects.toThrow('pool exhausted');
    pool.connect(jest.fn());

    expect(counterAdd).toHaveBeenCalledTimes(2);
  });

  it('stops reporting a pool once it is unregistered', async () => {
    const { pool } = createRawPool();

    service.registerPool({
      poolName: DatabasePoolName.WorkspaceV2Primary,
      pool,
    });
    service.unregisterPool(DatabasePoolName.WorkspaceV2Primary);

    const callback = gaugeCallbacks.get(
      'twenty_database_pool_total_connections',
    );

    expect(await callback?.()).toEqual([]);
  });
});
