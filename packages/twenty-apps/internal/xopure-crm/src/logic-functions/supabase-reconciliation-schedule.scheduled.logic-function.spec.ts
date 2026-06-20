import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  client: {
    query: vi.fn(),
    mutation: vi.fn(),
  },
  readSourceBatch: vi.fn(),
  CoreApiClient: vi.fn(),
  createSupabaseReaderFromAnyEnv: vi.fn(),
  defineLogicFunction: vi.fn((config: unknown) => config),
  runXopureBackfill: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: mocks.CoreApiClient,
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: mocks.defineLogicFunction,
}));

vi.mock('src/supabase-sync/backfill/read-supabase-rest-source', () => ({
  createSupabaseReaderFromAnyEnv: mocks.createSupabaseReaderFromAnyEnv,
}));

vi.mock('src/supabase-sync/backfill/run-xopure-backfill', () => ({
  runXopureBackfill: mocks.runXopureBackfill,
}));

import { handler } from './supabase-reconciliation-schedule.scheduled.logic-function';

describe('supabase reconciliation schedule handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.CoreApiClient.mockReturnValue(mocks.client);
    mocks.createSupabaseReaderFromAnyEnv.mockReturnValue(
      mocks.readSourceBatch,
    );
  });

  it('defaults scheduled runs to live mode and returns the backfill summary', async () => {
    mocks.runXopureBackfill.mockResolvedValue({
      dryRun: false,
      scanned: 8,
      mapped: 7,
      created: 3,
      updated: 2,
      skipped: 1,
      failed: 1,
      tableCount: 8,
      durationMs: 42,
      errors: [],
    });

    const result = await handler();

    expect(mocks.CoreApiClient).toHaveBeenCalledTimes(1);
    expect(mocks.createSupabaseReaderFromAnyEnv).toHaveBeenCalledTimes(1);
    const envArg = mocks.createSupabaseReaderFromAnyEnv.mock.calls[0]?.[0];
    expect(envArg === process.env).toBe(true);
    expect(mocks.runXopureBackfill).toHaveBeenCalledWith({
      client: mocks.client,
      readSourceBatch: mocks.readSourceBatch,
      dryRun: false,
    });
    expect(result).toEqual({
      dryRun: false,
      scanned: 8,
      mapped: 7,
      created: 3,
      updated: 2,
      skipped: 1,
      failed: 1,
      tableCount: 8,
      durationMs: 42,
      completedAt: expect.any(String),
    });
    expect(result).not.toHaveProperty('processed');
    expect(result).not.toHaveProperty('total');
  });

  it('preserves dryRun true and resolves sourceTable aliases', async () => {
    mocks.runXopureBackfill.mockResolvedValue({
      dryRun: true,
      scanned: 1,
      mapped: 1,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      tableCount: 1,
      durationMs: 12,
      records: [],
      errors: [],
    });

    const result = await handler({ dryRun: true, sourceTable: 'product' });

    expect(mocks.runXopureBackfill).toHaveBeenCalledWith({
      client: mocks.client,
      readSourceBatch: mocks.readSourceBatch,
      dryRun: true,
      sourceTables: ['products'],
    });
    expect(result).toMatchObject({
      dryRun: true,
      scanned: 1,
      mapped: 1,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      tableCount: 1,
      durationMs: 12,
    });
  });
});
