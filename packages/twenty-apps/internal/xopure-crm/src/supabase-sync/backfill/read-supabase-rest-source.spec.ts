import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  SOURCE_TABLE_TO_REST_SOURCE,
  createSupabaseRestReader,
  createSupabaseRestReaderFromEnv,
} from './read-supabase-rest-source';

describe('SOURCE_TABLE_TO_REST_SOURCE', () => {
  it('reads products from the public products table', () => {
    expect(SOURCE_TABLE_TO_REST_SOURCE.products.table).toBe('products');
  });

  it('keeps product selects compatible with the current public schema', () => {
    expect(SOURCE_TABLE_TO_REST_SOURCE.products.select).toContain(
      'cv_amount:cv_amount_cents',
    );
    expect(SOURCE_TABLE_TO_REST_SOURCE.products.select).not.toContain('slug');
    expect(SOURCE_TABLE_TO_REST_SOURCE.products.select).not.toContain(
      'stock_quantity',
    );
  });

  it('does not require updated_at on sources that only expose created_at', () => {
    expect(SOURCE_TABLE_TO_REST_SOURCE.affiliates.select).not.toContain(
      'updated_at',
    );
    expect(SOURCE_TABLE_TO_REST_SOURCE.orders.select).not.toContain(
      'updated_at',
    );
    expect(SOURCE_TABLE_TO_REST_SOURCE.orders.select).not.toContain(
      'commerce_order_id',
    );
  });

  it('reads payments from sanitized order columns', () => {
    expect(SOURCE_TABLE_TO_REST_SOURCE.payments.table).toBe('orders');
    expect(SOURCE_TABLE_TO_REST_SOURCE.payments.select).toContain(
      'provider:payment_gateway',
    );
    expect(SOURCE_TABLE_TO_REST_SOURCE.payments.select).not.toContain(
      'gateway_payload',
    );
  });
});

describe('createSupabaseRestReader', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches read-only pages with the publishable key and concatenates rows', async () => {
    const page1 = [
      { id: 'prod_1', name: 'Alpha', updated_at: '2026-01-01T00:00:00.000Z' },
      { id: 'prod_2', name: 'Beta', updated_at: '2026-01-02T00:00:00.000Z' },
    ];
    const page2 = [
      { id: 'prod_3', name: 'Gamma', updated_at: '2026-01-03T00:00:00.000Z' },
    ];

    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(page1), {
          status: 206,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(page2), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetch);

    const reader = createSupabaseRestReader({
      url: 'https://project.supabase.co',
      key: 'publishable-key',
      batchSize: 2,
    });

    await expect(reader('products')).resolves.toEqual([
      { ...page1[0], updated_at: '2026-01-01T00:00:00Z' },
      { ...page1[1], updated_at: '2026-01-02T00:00:00Z' },
      { ...page2[0], updated_at: '2026-01-03T00:00:00Z' },
    ]);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/rest/v1/products?'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          apikey: 'publishable-key',
          Authorization: 'Bearer publishable-key',
          Range: '0-1',
          'Range-Unit': 'items',
        }),
      }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Range: '2-3',
        }),
      }),
    );
  });

  it('normalizes Supabase timestamp strings to Twenty date-time format', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 'prod_1',
            name: 'Alpha',
            created_at: '2026-06-04T19:52:57.00728+00:00',
            updated_at: '2026-06-04T19:52:58.12345+00:00',
          },
        ]),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    vi.stubGlobal('fetch', fetch);

    const reader = createSupabaseRestReader({
      url: 'https://project.supabase.co',
      key: 'publishable-key',
      batchSize: 100,
    });

    await expect(reader('products')).resolves.toEqual([
      expect.objectContaining({
        created_at: '2026-06-04T19:52:57Z',
        updated_at: '2026-06-04T19:52:58Z',
      }),
    ]);
  });

  it('returns an empty page for a missing optional public table', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: 'PGRST205' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetch);

    const reader = createSupabaseRestReader({
      url: 'https://project.supabase.co',
      key: 'publishable-key',
      batchSize: 100,
    });

    await expect(reader('profiles')).resolves.toEqual([]);
  });

  it('does not leak the key or project URL in error messages', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'permission denied' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetch);

    const reader = createSupabaseRestReader({
      url: 'https://secret-project.supabase.co',
      key: 'secret-publishable-key',
      batchSize: 100,
    });

    await expect(reader('orders')).rejects.toThrow(/orders/);

    let error: unknown;
    try {
      await reader('orders');
    } catch (err) {
      error = err;
    }

    const message = String(error);
    expect(message).not.toContain('secret-project');
    expect(message).not.toContain('secret-publishable-key');
  });
});

describe('createSupabaseRestReaderFromEnv', () => {
  it('requires the REST URL and key environment variables', () => {
    expect(() => createSupabaseRestReaderFromEnv({})).toThrow(
      'XOPURE_SUPABASE_READONLY_REST_URL',
    );
  });
});
