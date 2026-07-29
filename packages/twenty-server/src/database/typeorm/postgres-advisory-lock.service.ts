import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type PoolClient } from 'pg';
import { DataSource } from 'typeorm';
import { type PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

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
  private readonly logger = new Logger(PostgresAdvisoryLockService.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async tryWithLock<T>(
    lockName: string,
    callback: () => Promise<T>,
  ): Promise<PostgresAdvisoryLockResult<T>> {
    const lockSession = await PostgresAdvisoryLockSession.tryAcquire(
      this.coreDataSource,
      lockName,
    );

    if (!lockSession) {
      return {
        acquired: false,
      };
    }

    const callbackResult = await this.captureCallbackResult(callback);
    const cleanupError = await lockSession.unlockAndClose();

    if (callbackResult.status === 'rejected') {
      if (cleanupError) {
        this.logger.warn(
          `Secondary PostgreSQL advisory lock error for "${lockName}" after callback failure: ${cleanupError}`,
        );
      }

      throw callbackResult.reason;
    }

    if (cleanupError) {
      throw cleanupError;
    }

    return {
      acquired: true,
      value: callbackResult.value,
    };
  }

  private async captureCallbackResult<T>(
    callback: () => Promise<T>,
  ): Promise<PromiseSettledResult<T>> {
    try {
      return {
        status: 'fulfilled',
        value: await callback(),
      };
    } catch (reason) {
      return {
        status: 'rejected',
        reason,
      };
    }
  }
}

class PostgresAdvisoryLockSession {
  private connectionError: Error | undefined;

  private readonly handleConnectionError = (error: Error) => {
    this.connectionError ??= error;
  };

  private constructor(
    private readonly connection: PoolClient,
    private readonly releaseConnection: (error?: Error) => void,
    private readonly lockName: string,
  ) {
    this.connection.on('error', this.handleConnectionError);
  }

  static async tryAcquire(
    dataSource: DataSource,
    lockName: string,
  ): Promise<PostgresAdvisoryLockSession | undefined> {
    const [connection, releaseConnection] = (await (
      dataSource.driver as PostgresDriver
    ).obtainMasterConnection()) as [PoolClient, (error?: Error) => void];
    const lockSession = new PostgresAdvisoryLockSession(
      connection,
      releaseConnection,
      lockName,
    );

    let isLockAcquired: boolean;

    try {
      isLockAcquired = await lockSession.tryAcquireLock();
    } catch (error) {
      lockSession.close(toError(error));
      throw error;
    }

    if (!isLockAcquired) {
      const closeError = lockSession.close();

      if (closeError) {
        throw closeError;
      }

      return undefined;
    }

    return lockSession;
  }

  async unlockAndClose(): Promise<Error | undefined> {
    let unlockError: Error | undefined;

    try {
      await this.unlock();
    } catch (error) {
      unlockError = toError(error);
    }

    return this.close(unlockError);
  }

  private async tryAcquireLock(): Promise<boolean> {
    const {
      rows: [result],
    } = await this.connection.query<{ acquired: boolean }>(
      `SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS "acquired"`,
      [this.lockName],
    );

    return result?.acquired === true;
  }

  private async unlock(): Promise<void> {
    const {
      rows: [result],
    } = await this.connection.query<{ released: boolean }>(
      `SELECT pg_advisory_unlock(hashtextextended($1, 0)) AS "released"`,
      [this.lockName],
    );

    if (result?.released !== true) {
      throw new Error(
        `Could not release PostgreSQL advisory lock ${this.lockName}`,
      );
    }
  }

  private close(error?: Error): Error | undefined {
    this.connection.removeListener('error', this.handleConnectionError);
    const errorToRelease = error ?? this.connectionError;

    if (errorToRelease) {
      this.releaseConnection(errorToRelease);
    } else {
      this.releaseConnection();
    }

    return errorToRelease;
  }
}
