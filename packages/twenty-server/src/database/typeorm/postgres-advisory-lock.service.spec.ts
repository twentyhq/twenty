import { type PoolClient } from 'pg';
import { type DataSource } from 'typeorm';
import { type PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';

describe('PostgresAdvisoryLockService', () => {
  const obtainMasterConnection = jest.fn();
  const dataSource = {
    driver: {
      obtainMasterConnection,
    } as unknown as PostgresDriver,
  } as unknown as DataSource;

  const createMockConnection = (isLockAcquired: boolean) => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({
        rows: [{ acquired: isLockAcquired }],
      })
      .mockResolvedValueOnce({
        rows: [{ released: true }],
      });
    const connection = {
      query,
      on: jest.fn(),
      removeListener: jest.fn(),
    } as unknown as PoolClient;
    const release = jest.fn();

    return {
      connection,
      query,
      release,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs the callback while holding the lock', async () => {
    const { connection, query, release } = createMockConnection(true);
    const callback = jest.fn().mockResolvedValue('result');

    obtainMasterConnection.mockResolvedValue([connection, release]);

    const result = await new PostgresAdvisoryLockService(
      dataSource,
    ).tryWithLock('lock-name', callback);

    expect(result).toEqual({
      acquired: true,
      value: 'result',
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('pg_advisory_unlock'),
      ['lock-name'],
    );
    expect(query.mock.invocationCallOrder[1]).toBeLessThan(
      release.mock.invocationCallOrder[0],
    );
  });

  it('does not run the callback when the lock is held', async () => {
    const { connection, query, release } = createMockConnection(false);
    const callback = jest.fn();

    obtainMasterConnection.mockResolvedValue([connection, release]);

    await expect(
      new PostgresAdvisoryLockService(dataSource).tryWithLock(
        'lock-name',
        callback,
      ),
    ).resolves.toEqual({
      acquired: false,
    });

    expect(callback).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('releases the lock when the callback fails', async () => {
    const { connection, query, release } = createMockConnection(true);
    const callbackError = new Error('callback failed');

    obtainMasterConnection.mockResolvedValue([connection, release]);

    await expect(
      new PostgresAdvisoryLockService(dataSource).tryWithLock(
        'lock-name',
        async () => {
          throw callbackError;
        },
      ),
    ).rejects.toBe(callbackError);

    expect(query).toHaveBeenCalledTimes(2);
    expect(release).toHaveBeenCalledWith();
  });

  it('discards the connection when releasing the lock fails', async () => {
    const { connection, query, release } = createMockConnection(true);
    const releaseError = new Error('release failed');

    query
      .mockReset()
      .mockResolvedValueOnce({
        rows: [{ acquired: true }],
      })
      .mockRejectedValueOnce(releaseError);
    obtainMasterConnection.mockResolvedValue([connection, release]);

    await expect(
      new PostgresAdvisoryLockService(dataSource).tryWithLock(
        'lock-name',
        async () => undefined,
      ),
    ).rejects.toBe(releaseError);

    expect(release).toHaveBeenCalledWith(releaseError);
  });
});
