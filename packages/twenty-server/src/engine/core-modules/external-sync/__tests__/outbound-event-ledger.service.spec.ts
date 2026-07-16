import { describe, expect, it, beforeEach } from '@jest/globals';

import { OutboundEventLedgerService } from '../outbound/outbound-event-ledger.service';

describe('OutboundEventLedgerService', () => {
  let service: OutboundEventLedgerService;

  beforeEach(() => {
    service = new OutboundEventLedgerService();
  });

  const baseEvent = {
    eventId: 'out-evt-001',
    idempotencyKey: 'out-idem-001',
    targetCollection: 'executives',
    payload: { name: 'Jane', title: 'CEO' },
    beforeHash: 'hash-before-001',
    afterHash: 'hash-after-001',
  };

  it('records a new outbound event', async () => {
    const record = await service.record(baseEvent);

    expect(record.eventId).toBe('out-evt-001');
    expect(record.status).toBe('PENDING');
    expect(record.beforeHash).toBe('hash-before-001');
    expect(record.afterHash).toBe('hash-after-001');
  });

  it('is idempotent — same idempotencyKey returns existing record', async () => {
    const first = await service.record(baseEvent);
    const second = await service.record(baseEvent);

    expect(second.id).toBe(first.id);
  });

  it('transitions PENDING → SIGNED → SENT', async () => {
    const record = await service.record(baseEvent);

    await service.markSigned(record.id);
    const signed = await service.getRecord(record.id);
    expect(signed?.status).toBe('SIGNED');
    expect(signed?.signedAt).toBeInstanceOf(Date);

    await service.markSent(record.id);
    const sent = await service.getRecord(record.id);
    expect(sent?.status).toBe('SENT');
    expect(sent?.sentAt).toBeInstanceOf(Date);
  });

  it('transitions to DEAD with error', async () => {
    const record = await service.record(baseEvent);

    await service.markDead(record.id, 'Send failed: connection refused');
    const dead = await service.getRecord(record.id);

    expect(dead?.status).toBe('DEAD');
    expect(dead?.lastError).toBe('Send failed: connection refused');
  });

  it('records before and after hashes', async () => {
    const record = await service.record(baseEvent);

    expect(record.beforeHash).toBe('hash-before-001');
    expect(record.afterHash).toBe('hash-after-001');
  });
});
