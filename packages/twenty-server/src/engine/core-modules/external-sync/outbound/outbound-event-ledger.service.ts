import { Injectable, Logger } from '@nestjs/common';

export enum OutboundEventStatus {
  PENDING = 'PENDING',
  SIGNED = 'SIGNED',
  SENT = 'SENT',
  DEAD = 'DEAD',
}

export interface OutboundEventRecord {
  id: string;
  eventId: string;
  idempotencyKey: string;
  targetCollection: string;
  payload: Record<string, unknown>;
  beforeHash?: string;
  afterHash?: string;
  status: OutboundEventStatus;
  signedAt?: Date;
  sentAt?: Date;
  lastError?: string;
}

/**
 * Outbound event ledger — records before/after content hashes,
 * manages status lifecycle (PENDING → SIGNED → SENT → DEAD).
 *
 * Processing rules 8, 11.
 */
@Injectable()
export class OutboundEventLedgerService {
  private readonly logger = new Logger(OutboundEventLedgerService.name);

  // In-memory store for PR2 — replaced by real CoreApiClient in PR3
  private readonly store: Map<string, OutboundEventRecord> = new Map();

  /**
   * Record a new outbound event with before/after hashes.
   */
  async record(event: {
    eventId: string;
    idempotencyKey: string;
    targetCollection: string;
    payload: Record<string, unknown>;
    beforeHash?: string;
    afterHash?: string;
  }): Promise<OutboundEventRecord> {
    // Check idempotency
    const existing = Array.from(this.store.values()).find(
      (r) => r.idempotencyKey === event.idempotencyKey,
    );
    if (existing) {
      this.logger.warn(
        `Idempotent outbound event, returning existing: ${event.idempotencyKey}`,
      );
      return existing;
    }

    const record: OutboundEventRecord = {
      id: crypto.randomUUID(),
      eventId: event.eventId,
      idempotencyKey: event.idempotencyKey,
      targetCollection: event.targetCollection,
      payload: event.payload,
      beforeHash: event.beforeHash,
      afterHash: event.afterHash,
      status: OutboundEventStatus.PENDING,
    };

    this.store.set(record.id, record);

    this.logger.log(
      `Recorded outbound event ${event.eventId} for ${event.targetCollection}`,
    );

    return record;
  }

  /**
   * Transition status from PENDING → SIGNED.
   */
  async markSigned(recordId: string): Promise<void> {
    const record = this.store.get(recordId);
    if (!record) {
      this.logger.warn(`Outbound event record ${recordId} not found`);
      return;
    }
    record.status = OutboundEventStatus.SIGNED;
    record.signedAt = new Date();
  }

  /**
   * Transition status from SIGNED → SENT.
   */
  async markSent(recordId: string): Promise<void> {
    const record = this.store.get(recordId);
    if (!record) {
      this.logger.warn(`Outbound event record ${recordId} not found`);
      return;
    }
    record.status = OutboundEventStatus.SENT;
    record.sentAt = new Date();
  }

  /**
   * Transition status → DEAD with error details.
   */
  async markDead(recordId: string, error: string): Promise<void> {
    const record = this.store.get(recordId);
    if (!record) {
      this.logger.warn(`Outbound event record ${recordId} not found`);
      return;
    }
    record.status = OutboundEventStatus.DEAD;
    record.lastError = error;
  }

  /**
   * Get a record by ID.
   */
  async getRecord(recordId: string): Promise<OutboundEventRecord | undefined> {
    return this.store.get(recordId);
  }

  // For testing
  _clearStore(): void {
    this.store.clear();
  }
}
