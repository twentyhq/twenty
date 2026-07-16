import { describe, expect, it, beforeEach } from '@jest/globals';

import { DeadLetterService, DeadLetterDirection, ConflictService, CheckpointService, ReconciliationService } from '../dead-letter/dead-letter.service';

describe('DeadLetterService', () => {
  let service: DeadLetterService;

  beforeEach(() => {
    service = new DeadLetterService();
  });

  it('dead-letters an event', async () => {
    const entry = await service.deadLetter({
      originalEventId: 'evt-fail-001',
      direction: DeadLetterDirection.INBOUND,
      payload: { name: 'Test' },
      errorCode: 'VALIDATION_ERROR',
      errorDetail: 'Invalid payload structure',
    });

    expect(entry.originalEventId).toBe('evt-fail-001');
    expect(entry.direction).toBe('INBOUND');
    expect(entry.errorCode).toBe('VALIDATION_ERROR');
  });

  it('inspects DLQ entries', async () => {
    await service.deadLetter({
      originalEventId: 'evt-fail-001',
      direction: DeadLetterDirection.INBOUND,
      payload: {},
      errorCode: 'ERR_1',
    });
    await service.deadLetter({
      originalEventId: 'evt-fail-002',
      direction: DeadLetterDirection.OUTBOUND,
      payload: {},
      errorCode: 'ERR_2',
    });

    const all = await service.inspect();
    expect(all).toHaveLength(2);

    const inbound = await service.inspect(DeadLetterDirection.INBOUND);
    expect(inbound).toHaveLength(1);
    expect(inbound[0].originalEventId).toBe('evt-fail-001');
  });

  it('replays a dead-lettered event', async () => {
    const entry = await service.deadLetter({
      originalEventId: 'evt-fail-001',
      direction: DeadLetterDirection.INBOUND,
      payload: {},
      errorCode: 'ERR_1',
    });

    const replayed = await service.replay(entry.id);
    expect(replayed).not.toBeNull();
    expect(replayed!.replayedAt).toBeInstanceOf(Date);
    expect(replayed!.replayCount).toBe(1);
  });

  it('replay is idempotent — second call returns without re-replaying', async () => {
    const entry = await service.deadLetter({
      originalEventId: 'evt-fail-001',
      direction: DeadLetterDirection.INBOUND,
      payload: {},
      errorCode: 'ERR_1',
    });

    await service.replay(entry.id);
    const replayedAgain = await service.replay(entry.id);
    expect(replayedAgain!.replayCount).toBe(1); // Not incremented again
  });

  it('returns null for unknown entry ID', async () => {
    const result = await service.replay('nonexistent-id');
    expect(result).toBeNull();
  });
});

describe('ConflictService', () => {
  let service: ConflictService;

  beforeEach(() => {
    service = new ConflictService();
  });

  it('creates an OPEN conflict', async () => {
    const result = await service.createConflict({
      recordRef: 'rec-001',
      field: 'name',
      authoritativeValue: 'Jane Doe',
    });

    expect(result.status).toBe('OPEN');
  });

  it('resolves a conflict', async () => {
    const { id } = await service.createConflict({
      recordRef: 'rec-001',
      field: 'name',
      authoritativeValue: 'Jane Doe',
    });

    const resolved = await service.resolveConflict(id, 'admin');
    expect(resolved?.status).toBe('RESOLVED');
  });

  it('returns all open conflicts', async () => {
    await service.createConflict({ recordRef: 'rec-001', field: 'name', authoritativeValue: 'Jane' });
    const resolved = await service.createConflict({ recordRef: 'rec-002', field: 'title', authoritativeValue: 'CEO' });
    await service.resolveConflict(resolved.id, 'admin');

    const open = await service.getOpenConflicts();
    expect(open).toHaveLength(1);
    expect(open[0].recordRef).toBe('rec-001');
  });
});

describe('CheckpointService', () => {
  let service: CheckpointService;

  beforeEach(() => {
    service = new CheckpointService();
  });

  it('upserts and retrieves a checkpoint', async () => {
    await service.upsertCheckpoint({
      workspaceId: 'ws-001',
      collection: 'executives',
      lastSyncedAt: new Date('2026-07-16T00:00:00Z'),
      cursor: { offset: 100 },
    });

    const cp = await service.getCheckpoint('ws-001', 'executives');
    expect(cp).not.toBeNull();
    expect(cp!.collection).toBe('executives');
    expect(cp!.cursor).toEqual({ offset: 100 });
  });

  it('returns null for nonexistent checkpoint', async () => {
    const cp = await service.getCheckpoint('ws-001', 'nonexistent');
    expect(cp).toBeNull();
  });

  it('upsert overwrites existing checkpoint for same workspace+collection', async () => {
    await service.upsertCheckpoint({
      workspaceId: 'ws-001',
      collection: 'executives',
      lastSyncedAt: new Date('2026-07-16T00:00:00Z'),
    });

    await service.upsertCheckpoint({
      workspaceId: 'ws-001',
      collection: 'executives',
      lastSyncedAt: new Date('2026-07-17T00:00:00Z'),
      cursor: { offset: 200 },
    });

    const cp = await service.getCheckpoint('ws-001', 'executives');
    expect(cp!.cursor).toEqual({ offset: 200 });
  });
});

describe('ReconciliationService', () => {
  let service: ReconciliationService;

  beforeEach(() => {
    service = new ReconciliationService();
  });

  it('creates a reconciliation run', async () => {
    const { id } = await service.createRun({
      scope: 'all',
      status: 'RUNNING',
      startedAt: new Date(),
    });

    expect(id).toBeDefined();
  });

  it('completes a run with summary', async () => {
    const { id } = await service.createRun({
      scope: 'all',
      status: 'RUNNING',
      startedAt: new Date(),
    });

    await service.completeRun(id, { totalFindings: 3 });

    // Create findings
    const finding1 = await service.createFinding({
      runId: id,
      kind: 'existence',
      recordRef: 'rec-001',
      severity: 'HIGH',
      detail: 'Record missing in Directus',
    });
    expect(finding1.id).toBeDefined();

    const finding2 = await service.createFinding({
      runId: id,
      kind: 'field-hash',
      recordRef: 'rec-002',
      severity: 'MEDIUM',
      detail: 'Hash mismatch for field name',
    });
    expect(finding2.id).toBeDefined();

    const findings = await service.getFindingsByRun(id);
    expect(findings).toHaveLength(2);
  });
});
