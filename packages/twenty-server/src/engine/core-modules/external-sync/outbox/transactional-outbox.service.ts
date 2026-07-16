import { Injectable, Logger } from '@nestjs/common';

export interface OutboxEntry {
  id: string;
  eventId: string;
  idempotencyKey: string;
  sourceSystem: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: 'PENDING' | 'SENT' | 'DEAD';
  attemptCount: number;
  nextAttemptAt?: Date;
  lastError?: string;
}

/**
 * Transactional outbox service.
 * append() writes the outbox row so it commits iff the business write commits.
 *
 * At PR2 time, we use in-memory storage. The real implementation will use
 * CoreApiClient mutation against the externalSyncOutbox workspace object.
 */
@Injectable()
export class TransactionalOutboxService {
  private readonly logger = new Logger(TransactionalOutboxService.name);

  // In-memory store for PR2
  private readonly store: Map<string, OutboxEntry> = new Map();

  /**
   * Append an outbox entry. Idempotent — duplicate idempotencyKey is a no-op.
   */
  async append(entry: {
    eventId: string;
    idempotencyKey: string;
    sourceSystem: string;
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<OutboxEntry | null> {
    // Check idempotency
    const existing = Array.from(this.store.values()).find(
      (r) => r.idempotencyKey === entry.idempotencyKey,
    );
    if (existing) {
      this.logger.warn(
        `Duplicate idempotencyKey ${entry.idempotencyKey}, skipping`,
      );
      return null;
    }

    const outboxEntry: OutboxEntry = {
      id: crypto.randomUUID(),
      eventId: entry.eventId,
      idempotencyKey: entry.idempotencyKey,
      sourceSystem: entry.sourceSystem,
      eventType: entry.eventType,
      payload: entry.payload,
      status: 'PENDING',
      attemptCount: 0,
      nextAttemptAt: new Date(),
    };

    this.store.set(outboxEntry.id, outboxEntry);

    this.logger.log(
      `Appended outbox entry ${entry.eventId} (${entry.eventType})`,
    );

    return outboxEntry;
  }

  /**
   * Get all PENDING entries past their nextAttemptAt.
   */
  async pollPending(): Promise<OutboxEntry[]> {
    const now = new Date();
    return Array.from(this.store.values()).filter(
      (e) =>
        e.status === 'PENDING' &&
        (!e.nextAttemptAt || e.nextAttemptAt <= now),
    );
  }

  /**
   * Mark an entry as SENT.
   */
  async markSent(entryId: string): Promise<void> {
    const entry = this.store.get(entryId);
    if (entry) {
      entry.status = 'SENT';
    }
  }

  /**
   * Mark an entry as DEAD.
   */
  async markDead(entryId: string, error: string): Promise<void> {
    const entry = this.store.get(entryId);
    if (entry) {
      entry.status = 'DEAD';
      entry.lastError = error;
    }
  }

  /**
   * Increment attempt count and compute exponential backoff.
   * Max backoff: ~2 hours (7200000 ms).
   */
  async incrementAttempt(entryId: string): Promise<void> {
    const entry = this.store.get(entryId);
    if (!entry) {
      return;
    }

    entry.attemptCount += 1;
    const baseDelayMs = 1000; // 1 second
    const maxDelayMs = 7200000; // 2 hours
    const delay = Math.min(
      baseDelayMs * Math.pow(2, entry.attemptCount - 1),
      maxDelayMs,
    );
    entry.nextAttemptAt = new Date(Date.now() + delay);
  }

  /**
   * Get an entry by ID.
   */
  async getEntry(entryId: string): Promise<OutboxEntry | undefined> {
    return this.store.get(entryId);
  }

  // For testing
  _clearStore(): void {
    this.store.clear();
  }
}
