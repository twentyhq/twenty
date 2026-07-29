import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type PoolClient } from 'pg';
import { DataSource } from 'typeorm';
import { type PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';

export type PostgresAdvisoryLockResult<T> =
  | {
      acquired: false;
    }
  | {
      acquired: true;
      value: T;
    };

@Injectable()
export class PostgresAdvisoryLockService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async tryWithLock<T>(
    lockName: string,
    callback: () => Promise<T>,
  ): Promise<PostgresAdvisoryLockResult<T>> {
    const [connection, release] = (await (
      this.coreDataSource.driver as PostgresDriver
    ).obtainMasterConnection()) as [PoolClient, (error?: Error) => void];
    let connectionError: Error | undefined;
    const handleConnectionError = (error: Error) => {
      connectionError ??= error;
    };
    const releaseConnection = (error?: Error) => {
      connection.removeListener('error', handleConnectionError);
      const errorToRelease = error ?? connectionError;

      if (errorToRelease) {
        release(errorToRelease);
      } else {
        release();
      }
    };

    connection.on('error', handleConnectionError);

    let isLockAcquired: boolean;

    try {
      isLockAcquired = await this.tryAcquireLock(connection, lockName);
    } catch (error) {
      releaseConnection(this.toError(error));
      throw error;
    }

    if (!isLockAcquired) {
      releaseConnection();

      if (connectionError) {
        throw connectionError;
      }

      return {
        acquired: false,
      };
    }

    try {
      return {
        acquired: true,
        value: await callback(),
      };
    } finally {
      try {
        await this.releaseLock(connection, lockName);
      } catch (error) {
        releaseConnection(this.toError(error));
        throw error;
      }

      releaseConnection();

      if (connectionError) {
        throw connectionError;
      }
    }
  }

  private async tryAcquireLock(
    connection: PoolClient,
    lockName: string,
  ): Promise<boolean> {
    const {
      rows: [result],
    } = await connection.query<{ acquired: boolean }>(
      `SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS "acquired"`,
      [lockName],
    );

    return result?.acquired === true;
  }

  private async releaseLock(
    connection: PoolClient,
    lockName: string,
  ): Promise<void> {
    const {
      rows: [result],
    } = await connection.query<{ released: boolean }>(
      `SELECT pg_advisory_unlock(hashtextextended($1, 0)) AS "released"`,
      [lockName],
    );

    if (result?.released !== true) {
      throw new Error(`Could not release PostgreSQL advisory lock ${lockName}`);
    }
  }

  private toError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
  }
}
