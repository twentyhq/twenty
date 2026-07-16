import { describe, expect, it, beforeEach } from '@jest/globals';

import { TransactionalOutboxService } from '../outbox/transactional-outbox.service';

describe('TransactionalOutboxService', () => {
  let service: TransactionalOutboxService;

  beforeEach(() => {
    service = new TransactionalOutboxService();
  });

  const baseEntry = {
    eventId: 'outbox-evt-001',
    idempotencyKey: 'outbox-idem-001',
    sourceSystem: 'TWENTY',
    eventType: 'executiveProfile.updated',
    payload: { name: 'Jane Doe' },
  };

  it('appends an outbox entry', async () => {
    const entry = await service.append(baseEntry);

    expect(entry).not.toBeNull();
    expect(entry!.eventId).toBe('outbox-evt-001');
    expect(entry!.status).toBe('PENDING');
    expect(entry!.attemptCount).toBe(0);
  });

  it('duplicate idempotencyKey returns null', async () => {
    await service.append(baseEntry);
    const duplicate = await service.append(baseEntry);

    expect(duplicate).toBeNull();
  });

  it('pollPending returns entries past nextAttemptAt', async () => {
    await service.append(baseEntry);

    const pending = await service.pollPending();
    expect(pending).toHaveLength(1);
  });

  it('marks entry as SENT', async () => {
    const entry = await service.append(baseEntry);

    await service.markSent(entry!.id);
    const updated = await service.getEntry(entry!.id);

    expect(updated?.status).toBe('SENT');
  });

  it('increments attempt count and backoff', async () => {
    const entry = await service.append(baseEntry);

    await service.incrementAttempt(entry!.id);
    const afterOne = await service.getEntry(entry!.id);
    expect(afterOne!.attemptCount).toBe(1);

    await service.incrementAttempt(entry!.id);
    const afterTwo = await service.getEntry(entry!.id);
    expect(afterTwo!.attemptCount).toBe(2);
    // Exponential backoff: 2^(n-1) seconds
    expect(afterTwo!.nextAttemptAt!.getTime()).toBeGreaterThan(Date.now());
  });

  it('marks entry as DEAD', async () => {
    const entry = await service.append(baseEntry);

    await service.markDead(entry!.id, 'Exhausted retries');
    const dead = await service.getEntry(entry!.id);

    expect(dead?.status).toBe('DEAD');
    expect(dead?.lastError).toBe('Exhausted retries');
  });

  it('pollPending does not return SENT entries', async () => {
    const entry = await service.append(baseEntry);
    await service.markSent(entry!.id);

    const pending = await service.pollPending();
    expect(pending).toHaveLength(0);
  });
});
