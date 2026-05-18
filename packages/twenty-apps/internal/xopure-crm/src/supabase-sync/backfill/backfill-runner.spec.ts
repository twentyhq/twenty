import { describe, expect, it, vi } from 'vitest';

import { runXopureBackfillDryRun } from './backfill-runner';

describe('runXopureBackfillDryRun', () => {
  it('maps records in deterministic dependency order without mutating Twenty', async () => {
    const readSourceBatch = vi.fn(async (sourceTable: string) => {
      if (sourceTable === 'products') {
        return [
          {
            id: 'product-b',
            sku: 'B',
            name: 'Product B',
            price_cents: 2000,
            updated_at: '2026-05-02T00:00:00.000Z',
          },
          {
            id: 'product-a',
            sku: 'A',
            name: 'Product A',
            price_cents: 1000,
            updated_at: '2026-05-01T00:00:00.000Z',
          },
        ];
      }

      if (sourceTable === 'orders') {
        return [
          {
            id: 'order-1',
            user_email: 'customer@example.test',
            subtotal_cents: 1000,
            total_cents: 1000,
            payment_status: 'paid',
            created_at: '2026-05-03T00:00:00.000Z',
            updated_at: '2026-05-03T00:00:00.000Z',
          },
        ];
      }

      return [];
    });
    const client = {
      query: vi.fn(async () => ({})),
      mutation: vi.fn(async () => ({})),
    };

    const result = await runXopureBackfillDryRun({
      sourceTables: ['orders', 'products'],
      readSourceBatch,
      client,
    });

    expect(result).toMatchObject({
      dryRun: true,
      scanned: 3,
      mapped: 3,
      failed: 0,
    });
    expect(result.records.map((record) => record.syncKey)).toEqual([
      'supabase.public.products.product-a',
      'supabase.public.products.product-b',
      'supabase.public.orders.order-1',
    ]);
    expect(readSourceBatch.mock.calls.map((call) => call[0])).toEqual([
      'products',
      'orders',
    ]);
    expect(client.mutation).not.toHaveBeenCalled();
  });

  it('reports permanent row failures while continuing the dry run', async () => {
    const result = await runXopureBackfillDryRun({
      sourceTables: ['products'],
      readSourceBatch: async () => [
        { sku: 'NO-ID', name: 'Missing ID' },
        { id: 'product-1', sku: 'OK', name: 'Mapped', price_cents: 1000 },
      ],
      client: {
        query: vi.fn(async () => ({})),
        mutation: vi.fn(async () => ({})),
      },
    });

    expect(result.scanned).toBe(2);
    expect(result.mapped).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.errors).toEqual([
      expect.objectContaining({
        code: 'MISSING_SOURCE_ID',
        retryable: false,
        sourceTable: 'products',
      }),
    ]);
  });
});
