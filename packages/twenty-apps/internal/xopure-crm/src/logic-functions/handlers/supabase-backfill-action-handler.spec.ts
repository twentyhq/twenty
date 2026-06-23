import { describe, expect, it, vi } from 'vitest';

import { handleSupabaseBackfillAction } from './supabase-backfill-action-handler';

const buildReadSourceBatch = () =>
  vi.fn(async (sourceTable: string) => {
    if (sourceTable === 'orders') {
      return [{ id: 'ord-1', total: 100 }, { id: 'ord-2', total: 200 }];
    }
    if (sourceTable === 'products') {
      return [{ id: 'prod-1', name: 'Widget' }];
    }
    if (sourceTable === 'affiliates') {
      return [{ id: 'aff-1', email: 'alice@example.com' }];
    }
    if (sourceTable === 'profiles') {
      return [{ id: 'prof-1', email: 'bob@example.com' }];
    }
    if (sourceTable === 'customer_expertise') {
      return [{ id: 'cust-1' }];
    }
    if (sourceTable === 'payments') {
      return [{ id: 'pay-1', amount: 50 }];
    }
    if (sourceTable === 'order_items') {
      return [{ id: 'item-1', productId: 'prod-1' }];
    }
    if (sourceTable === 'commission_ledger') {
      return [{ id: 'comm-1', amount: 25 }];
    }
    if (sourceTable === 'support_tickets') {
      return [{ id: 'ticket-1', ticket_number: 'XO-1' }];
    }
    return [];
  });

const buildClient = () => ({
  query: vi.fn(async () => ({ data: { records: [] } })),
  mutation: vi.fn(async () => ({ data: { createRecord: { id: 'new-1' } } })),
});

describe('handleSupabaseBackfillAction', () => {
  it('defaults to dry-run and processes all supported tables when sourceTable is absent', async () => {
    const readSourceBatch = buildReadSourceBatch();
    const client = buildClient();

    const result = await handleSupabaseBackfillAction({
      input: {},
      client,
      readSourceBatch,
    });

    expect(result).toMatchObject({
      success: true,
      dryRun: true,
      scanned: expect.any(Number),
      mapped: expect.any(Number),
      failed: expect.any(Number),
      tableCount: 9,
      durationMs: expect.any(Number),
      completedAt: expect.any(String),
    });

    expect(readSourceBatch).toHaveBeenCalledTimes(9);
    expect(readSourceBatch).toHaveBeenCalledWith('profiles');
    expect(readSourceBatch).toHaveBeenCalledWith('customer_expertise');
    expect(readSourceBatch).toHaveBeenCalledWith('affiliates');
    expect(readSourceBatch).toHaveBeenCalledWith('products');
    expect(readSourceBatch).toHaveBeenCalledWith('orders');
    expect(readSourceBatch).toHaveBeenCalledWith('payments');
    expect(readSourceBatch).toHaveBeenCalledWith('order_items');
    expect(readSourceBatch).toHaveBeenCalledWith('commission_ledger');
    expect(readSourceBatch).toHaveBeenCalledWith('support_tickets');

    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(() => new Date(result.completedAt as string)).not.toThrow();

    const fields = Object.keys(result);
    expect(fields).not.toContain('records');
    expect(fields).not.toContain('errors');
    expect(fields).not.toContain('rawPayload');
  });

  it('processes only the specified supported sourceTable when provided', async () => {
    const readSourceBatch = buildReadSourceBatch();
    const client = buildClient();

    const result = await handleSupabaseBackfillAction({
      input: { sourceTable: 'orders' },
      client,
      readSourceBatch,
    });

    expect(result).toMatchObject({
      success: true,
      dryRun: true,
      tableCount: 1,
      scanned: 2,
      mapped: expect.any(Number),
      failed: 0,
      durationMs: expect.any(Number),
      completedAt: expect.any(String),
    });

    expect(readSourceBatch).toHaveBeenCalledTimes(1);
    expect(readSourceBatch).toHaveBeenCalledWith('orders');
  });

  it('rejects an unsupported sourceTable without calling the reader', async () => {
    const readSourceBatch = buildReadSourceBatch();
    const client = buildClient();

    const result = await handleSupabaseBackfillAction({
      input: { sourceTable: 'non_existent_table' },
      client,
      readSourceBatch,
    });

    expect(result).toEqual({
      success: false,
      error: { code: 'UNSUPPORTED_SOURCE_TABLE' },
    });
    expect(readSourceBatch).not.toHaveBeenCalled();
  });

  it('never includes Supabase credential fields in the returned result', async () => {
    const readSourceBatch = buildReadSourceBatch();
    const client = buildClient();

    const result = await handleSupabaseBackfillAction({
      input: { sourceTable: 'products' },
      client,
      readSourceBatch,
    });

    const resultStr = JSON.stringify(result);
    const sensitivePatterns = [
      'dsn',
      'DATABASE_URL',
      'SUPABASE_URL',
      'SUPABASE_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'connectionString',
      'password',
      'secret',
    ];
    for (const pattern of sensitivePatterns) {
      expect(resultStr).not.toContain(pattern);
    }
  });

  it('resolves alias sourceTable to canonical table name via getSourceTableMapping', async () => {
    const readSourceBatch = buildReadSourceBatch();
    const client = buildClient();

    const result = await handleSupabaseBackfillAction({
      input: { sourceTable: 'product' },
      client,
      readSourceBatch,
});

    expect(result).toMatchObject({
      success: true,
      dryRun: true,
      tableCount: 1,
    });
    expect(readSourceBatch).toHaveBeenCalledTimes(1);
    expect(readSourceBatch).toHaveBeenCalledWith('products');
  });
});
