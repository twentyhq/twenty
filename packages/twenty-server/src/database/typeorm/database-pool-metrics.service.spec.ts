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

describe('DatabasePoolMetricsService', () => {
  let service: DatabasePoolMetricsService;
  let gaugeCallbacks: Map<string, GaugeCallback>;
  let histogramRecord: jest.Mock;

  beforeEach(() => {
    gaugeCallbacks = new Map();
    histogramRecord = jest.fn();

    const metricsService = {
      getMeter: jest.fn().mockReturnValue({
        createHistogram: jest.fn().mockReturnValue({
          record: histogramRecord,
        }),
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

    await expect(dataSource.driver.obtainMasterConnection()).rejects.toThrow(
      error,
    );
    expect(histogramRecord).toHaveBeenCalledWith(0, {
      pool: DatabasePoolName.Core,
    });
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
});
