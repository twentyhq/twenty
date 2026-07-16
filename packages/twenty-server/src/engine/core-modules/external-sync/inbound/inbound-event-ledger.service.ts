import crypto from 'crypto';

import { Injectable, Logger } from '@nestjs/common';

// Types for the inbound event lifecycle
export enum InboundEventStatus {
  RECEIVED = 'RECEIVED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  DEAD = 'DEAD',
}

export interface InboundEventReceipt {
  eventId: string;
  idempotencyKey: string;
  sourceSystem: string;
  sourceCollection: string;
  sourceRecordId: string;
  workspaceKey: string;
  rawEnvelope: Record<string, unknown>;
  workspaceId: string;
}

export interface InboundEventRecord {
  id: string;
  eventId: string;
  idempotencyKey: string;
  sourceSystem: string;
  sourceCollection: string;
  rawEnvelope: Record<string, unknown>;
  status: string;
  lastError?: string;
  processedAt?: Date;
}

/**
 * Manages the inbound event lifecycle: RECEIVED → PROCESSING → PROCESSED/DEAD.
 * Dedup by (workspaceId, eventId) and (workspaceId, idempotencyKey).
 *
 * Processing rules 1–4, 8, 9, 12.
 */
@Injectable()
export class InboundEventLedgerService {
  private readonly logger = new Logger(InboundEventLedgerService.name);

  // In-memory store for PR2 — replaced by real CoreApiClient in PR3
  private readonly store: Map<string, InboundEventRecord> = new Map();

  /**
   * Persist a receipt. Returns the existing record if a duplicate is found.
   */
  async persistReceipt(
    receipt: InboundEventReceipt,
  ): Promise<{ record: InboundEventRecord; isDuplicate: boolean }> {
    const eventDedupKey = `${receipt.workspaceId}::event::${receipt.eventId}`;
    const idempotencyDedupKey = `${receipt.workspaceId}::idempotency::${receipt.idempotencyKey}`;

    // Check duplicates
    const existingByEventId = this.store.get(eventDedupKey);
    if (existingByEventId) {
      this.logger.warn(
        `Duplicate eventId ${receipt.eventId} for workspace ${receipt.workspaceId}`,
      );
      return { record: existingByEventId, isDuplicate: true };
    }

    const existingByIdempotencyKey = this.store.get(idempotencyDedupKey);
    if (existingByIdempotencyKey) {
      this.logger.warn(
        `Duplicate idempotencyKey ${receipt.idempotencyKey} for workspace ${receipt.workspaceId}`,
      );
      return { record: existingByIdempotencyKey, isDuplicate: true };
    }

    const record: InboundEventRecord = {
      id: crypto.randomUUID(),
      eventId: receipt.eventId,
      idempotencyKey: receipt.idempotencyKey,
      sourceSystem: receipt.sourceSystem,
      sourceCollection: receipt.sourceCollection,
      rawEnvelope: receipt.rawEnvelope,
      status: InboundEventStatus.RECEIVED,
    };

    this.store.set(eventDedupKey, record);
    this.store.set(idempotencyDedupKey, record);

    this.logger.log(
      `Persisted inbound event receipt ${receipt.eventId} (workspace ${receipt.workspaceId})`,
    );

    return { record, isDuplicate: false };
  }

  /**
   * Transition status from RECEIVED → PROCESSING.
   */
  async markProcessing(recordId: string): Promise<void> {
    await this.updateStatus(recordId, InboundEventStatus.PROCESSING);
  }

  /**
   * Transition status from PROCESSING → PROCESSED.
   */
  async markProcessed(recordId: string): Promise<void> {
    await this.updateStatus(recordId, InboundEventStatus.PROCESSED);
  }

  /**
   * Transition status from PROCESSING → DEAD with error details.
   */
  async markDead(recordId: string, error: string): Promise<void> {
    await this.updateStatus(recordId, InboundEventStatus.DEAD, error);
  }

  private async updateStatus(
    recordId: string,
    status: InboundEventStatus,
    error?: string,
  ): Promise<void> {
    for (const record of this.store.values()) {
      if (record.id === recordId) {
        record.status = status;
        if (error) {
          record.lastError = error;
        }
        if (status === InboundEventStatus.PROCESSED) {
          record.processedAt = new Date();
        }
        return;
      }
    }
    this.logger.warn(
      `Inbound event record ${recordId} not found for status update`,
    );
  }

  /**
   * Retrieve a record by ID (for replay).
   */
  async getRecord(recordId: string): Promise<InboundEventRecord | undefined> {
    for (const record of this.store.values()) {
      if (record.id === recordId) {
        return record;
      }
    }
    return undefined;
  }

  // For testing
  _clearStore(): void {
    this.store.clear();
  }
}
