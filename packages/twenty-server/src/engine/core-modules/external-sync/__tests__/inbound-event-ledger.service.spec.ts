import { describe, expect, it, beforeEach } from '@jest/globals';

import {
  InboundEventLedgerService,
  InboundEventReceipt,
} from '../inbound/inbound-event-ledger.service';

describe('InboundEventLedgerService', () => {
  let service: InboundEventLedgerService;

  const baseReceipt: InboundEventReceipt = {
    eventId: 'evt-001',
    idempotencyKey: 'idem-001',
    sourceSystem: 'DIRECTUS',
    sourceCollection: 'executives',
    sourceRecordId: 'rec-001',
    workspaceKey: 'ws-key-001',
    rawEnvelope: { test: true },
    workspaceId: 'ws-001',
  };

  beforeEach(() => {
    service = new InboundEventLedgerService();
  });

  it('persists a receipt', async () => {
    const { record, isDuplicate } = await service.persistReceipt(baseReceipt);

    expect(record.eventId).toBe('evt-001');
    expect(record.status).toBe('RECEIVED');
    expect(isDuplicate).toBe(false);
  });

  it('dedups by eventId', async () => {
    await service.persistReceipt(baseReceipt);
    const { isDuplicate } = await service.persistReceipt(baseReceipt);

    expect(isDuplicate).toBe(true);
  });

  it('dedups by idempotencyKey', async () => {
    await service.persistReceipt(baseReceipt);

    const receipt2: InboundEventReceipt = {
      ...baseReceipt,
      eventId: 'evt-002',
    };

    const { isDuplicate } = await service.persistReceipt(receipt2);

    expect(isDuplicate).toBe(true);
  });

  it('transitions status RECEIVED → PROCESSING → PROCESSED', async () => {
    const { record } = await service.persistReceipt(baseReceipt);

    await service.markProcessing(record.id);
    const processing = await service.getRecord(record.id);
    expect(processing?.status).toBe('PROCESSING');

    await service.markProcessed(record.id);
    const processed = await service.getRecord(record.id);
    expect(processed?.status).toBe('PROCESSED');
    expect(processed?.processedAt).toBeInstanceOf(Date);
  });

  it('transitions to DEAD with error', async () => {
    const { record } = await service.persistReceipt(baseReceipt);

    await service.markDead(record.id, 'Validation failed');
    const dead = await service.getRecord(record.id);

    expect(dead?.status).toBe('DEAD');
    expect(dead?.lastError).toBe('Validation failed');
  });

  it('replay returns existing record without duplicate', async () => {
    const { record } = await service.persistReceipt(baseReceipt);
    await service.markProcessed(record.id);

    const replay = await service.persistReceipt(baseReceipt);
    expect(replay.isDuplicate).toBe(true);
    expect(replay.record.id).toBe(record.id);
  });
});
