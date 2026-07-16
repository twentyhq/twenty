import { describe, expect, it, beforeEach } from '@jest/globals';

import { OutboxScopingGuard } from '../outbox/outbox-scoping-guard.util';

describe('OutboxScopingGuard', () => {
  let guard: OutboxScopingGuard;

  beforeEach(() => {
    guard = new OutboxScopingGuard();
  });

  it('returns false when no externalEntityLink table (PR2 stub)', async () => {
    const result = await guard.isSyncEnabled('ws-001', 'executiveProfile');
    expect(result).toBe(false);
  });

  it('tolerates missing table gracefully', async () => {
    // Should not throw
    const result = await guard.isSyncEnabled('ws-missing', 'nonexistentObject');
    expect(result).toBe(false);
  });

  it('returns false for sync table names', async () => {
    const result = await guard.isSyncEnabled('ws-001', 'externalSyncOutbox');
    expect(result).toBe(false);
  });
});
