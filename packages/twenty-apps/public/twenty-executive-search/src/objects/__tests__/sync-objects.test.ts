import { describe, expect, it } from 'vitest';

import { EXTERNAL_SYNC_OUTBOX_UNIVERSAL_IDENTIFIER } from '../external-sync-outbox.object';
import { EXTERNAL_SYNC_INBOUND_EVENT_UNIVERSAL_IDENTIFIER } from '../external-sync-inbound-event.object';
import { EXTERNAL_SYNC_OUTBOUND_EVENT_UNIVERSAL_IDENTIFIER } from '../external-sync-outbound-event.object';
import { EXTERNAL_SYNC_DEAD_LETTER_UNIVERSAL_IDENTIFIER } from '../external-sync-dead-letter.object';
import { EXTERNAL_SYNC_CONFLICT_UNIVERSAL_IDENTIFIER } from '../external-sync-conflict.object';
import { EXTERNAL_SYNC_CHECKPOINT_UNIVERSAL_IDENTIFIER } from '../external-sync-checkpoint.object';
import { EXTERNAL_SYNC_RECONCILIATION_RUN_UNIVERSAL_IDENTIFIER } from '../external-sync-reconciliation-run.object';
import { EXTERNAL_SYNC_RECONCILIATION_FINDING_UNIVERSAL_IDENTIFIER } from '../external-sync-reconciliation-finding.object';

const ALL_OBJECT_UIDS = [
  ['externalSyncOutbox', EXTERNAL_SYNC_OUTBOX_UNIVERSAL_IDENTIFIER],
  ['externalSyncInboundEvent', EXTERNAL_SYNC_INBOUND_EVENT_UNIVERSAL_IDENTIFIER],
  ['externalSyncOutboundEvent', EXTERNAL_SYNC_OUTBOUND_EVENT_UNIVERSAL_IDENTIFIER],
  ['externalSyncDeadLetter', EXTERNAL_SYNC_DEAD_LETTER_UNIVERSAL_IDENTIFIER],
  ['externalSyncConflict', EXTERNAL_SYNC_CONFLICT_UNIVERSAL_IDENTIFIER],
  ['externalSyncCheckpoint', EXTERNAL_SYNC_CHECKPOINT_UNIVERSAL_IDENTIFIER],
  ['externalSyncReconciliationRun', EXTERNAL_SYNC_RECONCILIATION_RUN_UNIVERSAL_IDENTIFIER],
  ['externalSyncReconciliationFinding', EXTERNAL_SYNC_RECONCILIATION_FINDING_UNIVERSAL_IDENTIFIER],
] as const;

describe('sync object universal identifiers', () => {
  it('all 8 UIDs are valid UUID v4', () => {
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    for (const [, uid] of ALL_OBJECT_UIDS) {
      expect(uid).toMatch(uuidV4Regex);
    }
  });

  it('all 8 UIDs are distinct from each other', () => {
    const uids = ALL_OBJECT_UIDS.map(([, uid]) => uid);
    expect(new Set(uids).size).toBe(uids.length);
  });
});

describe('externalSyncOutbox', () => {
  it('validates without errors', async () => {
    const mod = await import('../external-sync-outbox.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('externalSyncInboundEvent', () => {
  it('validates without errors', async () => {
    const mod = await import('../external-sync-inbound-event.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('externalSyncOutboundEvent', () => {
  it('validates without errors', async () => {
    const mod = await import('../external-sync-outbound-event.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('externalSyncDeadLetter', () => {
  it('validates without errors', async () => {
    const mod = await import('../external-sync-dead-letter.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('externalSyncConflict', () => {
  it('validates without errors', async () => {
    const mod = await import('../external-sync-conflict.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('externalSyncCheckpoint', () => {
  it('validates without errors', async () => {
    const mod = await import('../external-sync-checkpoint.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('externalSyncReconciliationRun', () => {
  it('validates without errors', async () => {
    const mod = await import('../external-sync-reconciliation-run.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('externalSyncReconciliationFinding', () => {
  it('validates without errors', async () => {
    const mod = await import('../external-sync-reconciliation-finding.object');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
