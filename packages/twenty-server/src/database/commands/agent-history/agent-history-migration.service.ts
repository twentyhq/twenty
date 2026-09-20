import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, type QueryRunner } from 'typeorm';

import { AgentHistoryMigrationDataService } from 'src/database/commands/agent-history/agent-history-migration-data.service';
import { AgentHistoryMigrationValidationService } from 'src/database/commands/agent-history/agent-history-migration-validation.service';
import { AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import { getAgentHistoryTable } from 'src/database/commands/agent-history/utils/get-agent-history-table.util';
import { AGENT_HISTORY_STORAGE_KEY } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-storage-key.constant';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { type AgentHistoryStorageState } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-state.type';

type Storage = AgentHistoryStorageState['storage'];

@Injectable()
export class AgentHistoryMigrationService {
  private readonly logger = new Logger(AgentHistoryMigrationService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly storageService: AgentHistoryStorageService,
    private readonly dataService: AgentHistoryMigrationDataService,
    private readonly validationService: AgentHistoryMigrationValidationService,
  ) {}

  async migrate({
    workspaceId,
    target,
    batchSize = 1000,
  }: {
    workspaceId: string;
    target: Storage;
    batchSize?: number;
  }): Promise<void> {
    if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 10000) {
      throw new Error('Batch size must be between 1 and 10000');
    }
    const runner = this.dataSource.createQueryRunner('master');
    let ownsRunnerLock = false;
    const runnerKey = `${AGENT_HISTORY_STORAGE_KEY}:runner:${workspaceId}`;
    try {
      await runner.connect();
      const [{ acquired }]: { acquired: boolean }[] = await runner.query(
        'SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS acquired',
        [runnerKey],
      );
      ownsRunnerLock = acquired;
      if (!acquired) {
        throw new Error(
          'An agent history migration is already running for this workspace',
        );
      }
      let state = await this.storageService.readState(runner, workspaceId);
      if (state.migration?.phase === 'aborting') {
        throw new Error(
          'Finish aborting the incomplete migration before starting another copy',
        );
      }
      if (state.storage === target && !isDefined(state.migration)) {
        return;
      }
      if (isDefined(state.migration) && state.migration.target !== target) {
        throw new Error(
          'Resume the in-progress migration or abort it before changing direction',
        );
      }
      await this.validationService.validateSchema({ runner, workspaceId });
      if (!isDefined(state.migration)) {
        state = await this.fenced({
          runner,
          workspaceId,
          work: async () => {
            const current = await this.storageService.readState(
              runner,
              workspaceId,
            );
            await this.validationService.assertNoActiveStreams({
              runner,
              workspaceId,
              source: current.storage,
            });
            await this.validationService.validateReferences({
              runner,
              workspaceId,
              storage: current.storage,
            });
            if (target === 'core') {
              await this.validationService.assertNoCoreIdCollisions({
                runner,
                workspaceId,
              });
            }
            const next: AgentHistoryStorageState = {
              ...current,
              migration: {
                phase: 'clearing',
                target,
                tableIndex: 0,
                lastId: null,
              },
            };
            await this.storageService.writeState(runner, workspaceId, next);
            return next;
          },
        });
      }
      if (state.migration?.phase === 'clearing') {
        await this.dataService.clearStore({
          runner,
          workspaceId,
          storage: target,
        });
        state = await this.fenced({
          runner,
          workspaceId,
          work: async () => {
            const next: AgentHistoryStorageState = {
              ...state,
              migration: {
                phase: 'copying',
                target,
                tableIndex: 0,
                lastId: null,
              },
            };
            await this.storageService.writeState(runner, workspaceId, next);
            return next;
          },
        });
      }
      while (
        isDefined(state.migration) &&
        state.migration.tableIndex < AGENT_HISTORY_TABLES.length
      ) {
        state = await this.fenced({
          runner,
          workspaceId,
          work: async () => {
            const current = await this.storageService.readState(
              runner,
              workspaceId,
            );
            const progress = current.migration;
            if (!isDefined(progress) || progress.target !== target) {
              throw new Error('Migration state changed unexpectedly');
            }
            const table = AGENT_HISTORY_TABLES[progress.tableIndex];
            const ids = await this.dataService.copyBatch({
              runner,
              workspaceId,
              table,
              source: current.storage,
              target,
              lastId: progress.lastId,
              batchSize,
            });
            const next: AgentHistoryStorageState = {
              ...current,
              migration: {
                phase: 'copying',
                target,
                tableIndex:
                  ids.length < batchSize
                    ? progress.tableIndex + 1
                    : progress.tableIndex,
                lastId: ids.length < batchSize ? null : ids[ids.length - 1],
              },
            };
            await this.storageService.writeState(runner, workspaceId, next);
            this.logger.log(
              `${workspaceId}: copied ${ids.length} ${table.name} rows`,
            );
            return next;
          },
        });
      }
      await this.fenced({
        runner,
        workspaceId,
        work: async () => {
          await this.validationService.verify({ runner, workspaceId });
          await this.validationService.validateReferences({
            runner,
            workspaceId,
            storage: target,
          });
          await this.storageService.writeState(runner, workspaceId, {
            storage: target,
            verifiedAt: new Date().toISOString(),
          });
        },
      });
      this.logger.log(`${workspaceId}: verified and switched to ${target}`);
    } finally {
      if (runner.isTransactionActive) {
        await runner.rollbackTransaction();
      }
      if (ownsRunnerLock) {
        await runner.query(
          'SELECT pg_advisory_unlock(hashtextextended($1, 0))',
          [runnerKey],
        );
      }
      await runner.release();
    }
  }

  async abort({
    workspaceId,
    dryRun,
  }: {
    workspaceId: string;
    dryRun: boolean;
  }): Promise<void> {
    const runner = this.dataSource.createQueryRunner('master');
    const key = `${AGENT_HISTORY_STORAGE_KEY}:runner:${workspaceId}`;
    let ownsLock = false;
    try {
      await runner.connect();
      const [{ acquired }]: { acquired: boolean }[] = await runner.query(
        'SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS acquired',
        [key],
      );
      ownsLock = acquired;
      if (!acquired) {
        throw new Error('Stop the running migration before aborting');
      }
      const state = await this.storageService.readState(runner, workspaceId);
      if (!isDefined(state.migration)) {
        return;
      }
      if (dryRun) {
        this.logger.log(
          `[DRY RUN] ${workspaceId}: would discard ${state.migration.target} destination; ${JSON.stringify(state.migration)}`,
        );
        return;
      }
      await this.fenced({
        runner,
        workspaceId,
        work: () =>
          this.storageService.writeState(runner, workspaceId, {
            ...state,
            migration: { ...state.migration!, phase: 'aborting' },
          }),
      });
      await this.dataService.clearStore({
        runner,
        workspaceId,
        storage: state.migration.target,
      });
      await this.fenced({
        runner,
        workspaceId,
        work: () =>
          this.storageService.writeState(runner, workspaceId, {
            ...state,
            migration: undefined,
          }),
      });
    } finally {
      if (runner.isTransactionActive) {
        await runner.rollbackTransaction();
      }
      if (ownsLock) {
        await runner.query(
          'SELECT pg_advisory_unlock(hashtextextended($1, 0))',
          [key],
        );
      }
      await runner.release();
    }
  }

  async inspect(workspaceId: string): Promise<void> {
    const runner = this.dataSource.createQueryRunner('master');
    try {
      await runner.connect();
      const state = await this.storageService.readState(runner, workspaceId);
      this.logger.log(`${workspaceId}: ${JSON.stringify(state)}`);
      await this.validationService.assertNoActiveStreams({
        runner,
        workspaceId,
        source: state.storage,
      });
      await this.validationService.validateReferences({
        runner,
        workspaceId,
        storage: state.storage,
      });
      for (const table of AGENT_HISTORY_TABLES) {
        const [{ count }] = await runner.query(
          `SELECT count(*) FROM ${getAgentHistoryTable({ workspaceId, storage: state.storage, name: table.name })} ${state.storage === 'core' ? 'WHERE "workspaceId" = $1' : ''}`,
          state.storage === 'core' ? [workspaceId] : [],
        );
        this.logger.log(`${workspaceId}: ${table.name}: ${count} source rows`);
      }
    } finally {
      await runner.release();
    }
  }

  async cleanup({
    workspaceId,
    dryRun,
    retentionDays,
  }: {
    workspaceId: string;
    dryRun: boolean;
    retentionDays: number;
  }): Promise<void> {
    if (!Number.isInteger(retentionDays) || retentionDays < 1) {
      throw new Error('Retention must be at least one day');
    }
    const runner = this.dataSource.createQueryRunner('master');
    const key = `${AGENT_HISTORY_STORAGE_KEY}:runner:${workspaceId}`;
    let ownsLock = false;
    try {
      await runner.connect();
      const [{ acquired }] = await runner.query(
        'SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS acquired',
        [key],
      );
      ownsLock = acquired;
      if (!ownsLock) {
        this.logger.log(
          `${workspaceId}: migration runner active; skipping cleanup`,
        );
        return;
      }
      const state = await this.storageService.readState(runner, workspaceId);
      if (
        state.storage !== 'workspace' ||
        isDefined(state.migration) ||
        !isDefined(state.verifiedAt)
      ) {
        this.logger.log(`${workspaceId}: not eligible; skipping cleanup`);
        return;
      }
      if (isDefined(state.cleanedAt)) {
        return;
      }
      const verifiedAt = Date.parse(state.verifiedAt);
      if (Date.now() - verifiedAt < retentionDays * 86400000) {
        this.logger.log(
          `${workspaceId}: retention window has not elapsed; skipping cleanup`,
        );
        return;
      }
      if (dryRun) {
        this.logger.log(`[DRY RUN] ${workspaceId}: eligible for cleanup`);
        return;
      }
      // The session lock excludes rollback; live workspace traffic can continue.
      await this.dataService.clearStore({
        runner,
        workspaceId,
        storage: 'core',
      });
      await this.storageService.writeState(runner, workspaceId, {
        ...state,
        cleanedAt: new Date().toISOString(),
      });
    } finally {
      if (ownsLock) {
        await runner.query(
          'SELECT pg_advisory_unlock(hashtextextended($1, 0))',
          [key],
        );
      }
      await runner.release();
    }
  }

  private async fenced<TResult>({
    runner,
    workspaceId,
    work,
  }: {
    runner: QueryRunner;
    workspaceId: string;
    work: () => Promise<TResult>;
  }): Promise<TResult> {
    await runner.startTransaction();
    try {
      await runner.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [`${AGENT_HISTORY_STORAGE_KEY}:${workspaceId}`],
      );
      const result = await work();
      await runner.commitTransaction();
      return result;
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    }
  }
}
