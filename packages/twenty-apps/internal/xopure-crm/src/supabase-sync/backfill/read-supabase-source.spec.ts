import { describe, expect, it, vi } from 'vitest';

import {
  SOURCE_TABLE_TO_PUBLIC_SOURCE,
  createSupabaseReader,
  createSupabaseReaderFromEnv,
} from './read-supabase-source';

describe('SOURCE_TABLE_TO_PUBLIC_SOURCE', () => {
  it('maps physical source tables to public.* tables', () => {
    expect(SOURCE_TABLE_TO_PUBLIC_SOURCE.products.table).toBe(
      'public.products',
    );
    expect(SOURCE_TABLE_TO_PUBLIC_SOURCE.affiliates.table).toBe(
      'public.affiliates',
    );
    expect(SOURCE_TABLE_TO_PUBLIC_SOURCE.orders.table).toBe(
      'public.orders',
    );
    expect(SOURCE_TABLE_TO_PUBLIC_SOURCE.order_items.table).toBe(
      'public.order_items',
    );
    expect(SOURCE_TABLE_TO_PUBLIC_SOURCE.commission_ledger.table).toBe(
      'public.commission_ledger',
    );
  });

  it('derives payments logical source from public.orders with column aliases', () => {
    const payments = SOURCE_TABLE_TO_PUBLIC_SOURCE.payments;
    expect(payments.table).toBe('public.orders');
    expect(payments.select).toContain('payment_gateway AS provider');
    expect(payments.select).toContain('payment_method_code AS method_code');
    expect(payments.select).toContain('total_cents AS amount_cents');
    expect(payments.select).toContain('payment_status AS status');
    expect(payments.select).toContain('id AS order_id');
    expect(payments.select).not.toContain('SELECT *');
  });

  it('has exactly 8 entries', () => {
    expect(Object.keys(SOURCE_TABLE_TO_PUBLIC_SOURCE)).toHaveLength(8);
  });
});

describe('createSupabaseReader', () => {
  it('queries the mapped view with limit/offset and concatenates pages', async () => {
    const page1 = [
      { id: 'a', name: 'Alpha', updated_at: '2026-01-01T00:00:00.000Z' },
      { id: 'b', name: 'Beta', updated_at: '2026-01-02T00:00:00.000Z' },
    ];
    const page2 = [
      { id: 'c', name: 'Gamma', updated_at: '2026-01-03T00:00:00.000Z' },
    ];

    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: page1 })
      .mockResolvedValueOnce({ rows: page2 })
      .mockResolvedValueOnce({ rows: [] });

    const fakePool = { query };

    const reader = createSupabaseReader({
      dsn: 'postgres://u:p@h:5432/db',
      batchSize: 2,
      createPool: () => fakePool as never,
    });

    const rows = await reader('profiles');

    expect(rows).toEqual([...page1, ...page2]);

    expect(query).toHaveBeenCalledTimes(2);

    expect(query).toHaveBeenNthCalledWith(1,
      expect.stringMatching(/public\.profiles/i),
      [2, 0],
    );

    expect(query).toHaveBeenNthCalledWith(2,
      expect.stringMatching(/public\.profiles/i),
      [2, 2],
    );

  });

  it('stops after a short page without a trailing query', async () => {
    const fullPage = Array.from({ length: 3 }, (_, i) => ({
      id: `${i}`,
      val: i,
    }));
    const shortPage = [{ id: 'x', val: 99 }];

    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: fullPage })
      .mockResolvedValueOnce({ rows: shortPage });

    const fakePool = { query };
    const reader = createSupabaseReader({
      dsn: 'postgres://u:p@h:5432/db',
      batchSize: 3,
      createPool: () => fakePool as never,
    });

    const rows = await reader('products');

    expect(rows).toEqual([...fullPage, ...shortPage]);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query).toHaveBeenNthCalledWith(1,
      expect.stringMatching(/public\.products/i),
      [3, 0],
    );
    expect(query).toHaveBeenNthCalledWith(2,
      expect.stringMatching(/public\.products/i),
      [3, 3],
    );
  });

  it('rejects unknown tables with Unsupported Supabase source table', async () => {
    const reader = createSupabaseReader({
      dsn: 'postgres://u:p@h:5432/db',
      batchSize: 100,
      createPool: () => ({ query: vi.fn() }) as never,
    });

    await expect(reader('unknown_table' as never)).rejects.toThrow(
      'Unsupported Supabase source table',
    );
  });

  it('nests the source table in query-failure errors and excludes the DSN', async () => {
    const dsn = 'postgres://s3kr1t:p4ss@supabase.internal:5432/xopure';
    const query = vi.fn().mockRejectedValue(new Error('connection refused'));
    const fakePool = { query };
    const reader = createSupabaseReader({
      dsn,
      batchSize: 10,
      createPool: () => fakePool as never,
    });

    let error: unknown;
    try {
      await reader('orders');
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    const msg = String(error);
    expect(msg).toMatch(/orders/i);
    expect(msg).not.toContain('s3kr1t');
    expect(msg).not.toContain('p4ss');
    expect(msg).not.toContain('supabase.internal');
  });

  it('returns an empty array when the source table has no rows', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const fakePool = { query };
    const reader = createSupabaseReader({
      dsn: 'postgres://u:p@h:5432/db',
      batchSize: 50,
      createPool: () => fakePool as never,
    });

    const rows = await reader('affiliates');

    expect(rows).toEqual([]);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(
      expect.stringMatching(/public\.affiliates/i),
      [50, 0],
    );
  });
});

describe('createSupabaseReaderFromEnv', () => {
  it('creates a reader using the DSN from the environment', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: '1' }] });
    const fakePool = { query };
    const env = {
      XOPURE_SUPABASE_READONLY_DSN: 'postgres://x:y@z:5432/db',
    };
    const deps = { createPool: () => fakePool as never };

    const reader = createSupabaseReaderFromEnv(env, deps);
    const rows = await reader('profiles');

    expect(rows).toEqual([{ id: '1' }]);
    expect(query).toHaveBeenCalledWith(
      expect.stringMatching(/public\.profiles/i),
      [expect.any(Number), 0],
    );
  });

  it('returns empty array for missing tables instead of throwing', async () => {
    const query = vi.fn().mockRejectedValue(
      Object.assign(new Error('relation does not exist'), { code: '42P01' }),
    );
    const fakePool = { query };
    const reader = createSupabaseReader({
      dsn: 'postgres://u:p@h:5432/db',
      batchSize: 50,
      createPool: () => fakePool as never,
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const rows = await reader('profiles');

    expect(rows).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('profiles'),
    );
    warnSpy.mockRestore();
  });

  it('throws on non-missing-table errors', async () => {
    const query = vi.fn().mockRejectedValue(
      Object.assign(new Error('permission denied'), { code: '42501' }),
    );
    const fakePool = { query };
    const reader = createSupabaseReader({
      dsn: 'postgres://u:p@h:5432/db',
      batchSize: 50,
      createPool: () => fakePool as never,
    });

    await expect(reader('products')).rejects.toThrow();
  });
  it('throws when XOPURE_SUPABASE_READONLY_DSN is missing', () => {
    expect(() =>
      createSupabaseReaderFromEnv(
        {},
        { createPool: () => ({ query: vi.fn() }) as never },
      ),
    ).toThrow('XOPURE_SUPABASE_READONLY_DSN is required');
  });
});
