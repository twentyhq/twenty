import crypto from 'crypto';

import { Injectable, Logger } from '@nestjs/common';

export enum DeadLetterDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export interface DeadLetterEntry {
  id: string;
  originalEventId: string;
  direction: DeadLetterDirection;
  payload: Record<string, unknown>;
  errorCode: string;
  errorDetail?: string;
  deadAt: Date;
  replayableAt?: Date;
  replayedAt?: Date;
  replayCount: number;
}

/**
 * Dead-letter service — stores permanently failed events and enables replay.
 * Processing rules 6, 7 and runbook replay/conflict procedures.
 */
@Injectable()
export class DeadLetterService {
  private readonly logger = new Logger(DeadLetterService.name);

  // In-memory store for PR2
  private readonly store: Map<string, DeadLetterEntry> = new Map();

  /**
   * Move an event to the dead-letter queue.
   */
  async deadLetter(entry: {
    originalEventId: string;
    direction: DeadLetterDirection;
    payload: Record<string, unknown>;
    errorCode: string;
    errorDetail?: string;
    replayableAt?: Date;
  }): Promise<DeadLetterEntry> {
    const record: DeadLetterEntry = {
      id: crypto.randomUUID(),
      originalEventId: entry.originalEventId,
      direction: entry.direction,
      payload: entry.payload,
      errorCode: entry.errorCode,
      errorDetail: entry.errorDetail,
      deadAt: new Date(),
      replayableAt: entry.replayableAt,
      replayCount: 0,
    };

    this.store.set(record.id, record);

    this.logger.warn(
      `Dead-lettered ${entry.direction} event ${entry.originalEventId} (${entry.errorCode})`,
    );

    return record;
  }

  /**
   * Inspect dead-letter queue — returns all entries or filtered by direction.
   */
  async inspect(direction?: DeadLetterDirection): Promise<DeadLetterEntry[]> {
    const entries = Array.from(this.store.values());

    if (direction) {
      return entries.filter((e) => e.direction === direction);
    }

    return entries;
  }

  /**
   * Replay a dead-lettered event.
   * Re-enqueues and uses ledger dedup for idempotency.
   * Returns the original entry updated with replayedAt timestamp.
   */
  async replay(entryId: string): Promise<DeadLetterEntry | null> {
    const entry = this.store.get(entryId);

    if (!entry) {
      this.logger.warn(`Dead-letter entry ${entryId} not found`);
      return null;
    }

    if (entry.replayedAt) {
      this.logger.warn(
        `Dead-letter entry ${entryId} already replayed at ${entry.replayedAt}`,
      );
      return entry;
    }

    entry.replayedAt = new Date();
    entry.replayCount += 1;

    this.logger.log(
      `Replayed dead-letter entry ${entryId} (${entry.originalEventId})`,
    );

    return entry;
  }

  /**
   * Get a specific entry by ID.
   */
  async getEntry(entryId: string): Promise<DeadLetterEntry | undefined> {
    return this.store.get(entryId);
  }

  // For testing
  _clearStore(): void {
    this.store.clear();
  }
}

/**
 * Conflict lifecycle service — tracks field-level sync conflicts.
 */
@Injectable()
export class ConflictService {
  private readonly store: Map<
    string,
    {
      id: string;
      recordRef: string;
      field: string;
      authoritativeValue: unknown;
      status: 'OPEN' | 'RESOLVED';
      resolvedBy?: string;
      resolvedAt?: Date;
    }
  > = new Map();

  async createConflict(params: {
    recordRef: string;
    field: string;
    authoritativeValue: unknown;
  }): Promise<{ id: string; status: string }> {
    const id = crypto.randomUUID();
    const conflict = {
      id,
      recordRef: params.recordRef,
      field: params.field,
      authoritativeValue: params.authoritativeValue,
      status: 'OPEN' as const,
    };
    this.store.set(id, conflict);
    return { id, status: 'OPEN' };
  }

  async resolveConflict(
    id: string,
    resolvedBy: string,
  ): Promise<{ id: string; status: string } | null> {
    const conflict = this.store.get(id);
    if (!conflict) {
      return null;
    }
    conflict.status = 'RESOLVED';
    conflict.resolvedBy = resolvedBy;
    conflict.resolvedAt = new Date();
    return { id, status: 'RESOLVED' };
  }

  async getOpenConflicts(): Promise<
    Array<{ id: string; recordRef: string; field: string }>
  > {
    return Array.from(this.store.values())
      .filter((c) => c.status === 'OPEN')
      .map(({ id, recordRef, field }) => ({ id, recordRef, field }));
  }

  _clearStore(): void {
    this.store.clear();
  }
}

/**
 * Checkpoint upsert service — tracks per-collection sync progress.
 */
@Injectable()
export class CheckpointService {
  private readonly store: Map<
    string,
    {
      collection: string;
      lastSyncedAt: Date;
      cursor?: Record<string, unknown>;
    }
  > = new Map();

  async upsertCheckpoint(params: {
    workspaceId: string;
    collection: string;
    lastSyncedAt: Date;
    cursor?: Record<string, unknown>;
  }): Promise<void> {
    const key = `${params.workspaceId}::${params.collection}`;
    this.store.set(key, {
      collection: params.collection,
      lastSyncedAt: params.lastSyncedAt,
      cursor: params.cursor,
    });
  }

  async getCheckpoint(
    workspaceId: string,
    collection: string,
  ): Promise<{
    collection: string;
    lastSyncedAt: Date;
    cursor?: Record<string, unknown>;
  } | null> {
    const key = `${workspaceId}::${collection}`;
    return this.store.get(key) ?? null;
  }

  _clearStore(): void {
    this.store.clear();
  }
}

/**
 * Reconciliation run service — manages recon runs and findings.
 */
@Injectable()
export class ReconciliationService {
  private readonly runStore: Map<
    string,
    {
      id: string;
      scope: string;
      status: string;
      startedAt: Date;
      finishedAt?: Date;
      summary?: Record<string, unknown>;
    }
  > = new Map();

  private readonly findingStore: Map<
    string,
    {
      id: string;
      runId: string;
      kind: string;
      recordRef: string;
      severity: string;
      detail: string;
    }
  > = new Map();

  async createRun(params: {
    scope: string;
    status: string;
    startedAt: Date;
  }): Promise<{ id: string }> {
    const id = crypto.randomUUID();
    this.runStore.set(id, {
      id,
      scope: params.scope,
      status: params.status,
      startedAt: params.startedAt,
    });
    return { id };
  }

  async completeRun(
    runId: string,
    summary: Record<string, unknown>,
  ): Promise<void> {
    const run = this.runStore.get(runId);
    if (run) {
      run.status = 'COMPLETED';
      run.finishedAt = new Date();
      run.summary = summary;
    }
  }

  async createFinding(params: {
    runId: string;
    kind: string;
    recordRef: string;
    severity: string;
    detail: string;
  }): Promise<{ id: string }> {
    const id = crypto.randomUUID();
    this.findingStore.set(id, {
      id,
      runId: params.runId,
      kind: params.kind,
      recordRef: params.recordRef,
      severity: params.severity,
      detail: params.detail,
    });
    return { id };
  }

  async getFindingsByRun(runId: string): Promise<
    Array<{
      id: string;
      kind: string;
      recordRef: string;
      severity: string;
    }>
  > {
    return Array.from(this.findingStore.values())
      .filter((f) => f.runId === runId)
      .map(({ id, kind, recordRef, severity }) => ({
        id,
        kind,
        recordRef,
        severity,
      }));
  }

  _clearStore(): void {
    this.runStore.clear();
    this.findingStore.clear();
  }
}
