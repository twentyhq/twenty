import { describe, expect, it, vi } from 'vitest';

import { handleSupabaseSyncWebhook } from './supabase-sync-webhook-handler';

const buildEvent = (params: {
  secret?: string;
  body?: Record<string, unknown>;
}) => ({
  headers: {
    ...(params.secret ? { 'x-xopure-sync-secret': params.secret } : {}),
  },
  body: params.body ?? {},
});

const buildClient = (params: {
  queryResults?: Array<Record<string, unknown>>;
  mutationResults?: Array<Record<string, unknown>>;
}) => {
  const queryResults = [...(params.queryResults ?? [])];
  const mutationResults = [...(params.mutationResults ?? [])];

  return {
    query: vi.fn(async () => queryResults.shift() ?? {}),
    mutation: vi.fn(async () => mutationResults.shift() ?? {}),
  };
};

describe('handleSupabaseSyncWebhook', () => {
  it('rejects requests without the configured shared secret', async () => {
    const client = buildClient({});

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'wrong-secret',
        body: { table: 'products', record: { id: 'product-1' } },
      }),
      expectedSecret: 'right-secret',
      client,
    });

    expect(result).toEqual({
      statusCode: 401,
      body: {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
          retryable: false,
        },
      },
    });
    expect(client.query).not.toHaveBeenCalled();
    expect(client.mutation).not.toHaveBeenCalled();
  });

  it('returns an actionable malformed payload error', async () => {
    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({ secret: 'secret', body: { table: 'products' } }),
      expectedSecret: 'secret',
      client: buildClient({}),
    });

    expect(result).toEqual({
      statusCode: 400,
      body: {
        ok: false,
        error: {
          code: 'MALFORMED_PAYLOAD',
          message: 'Supabase webhook payload must include table and record.',
          retryable: false,
        },
      },
    });
  });

  it('accepts unsupported tables without raw payload echo', async () => {
    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'secret',
        body: {
          type: 'INSERT',
          schema: 'public',
          table: 'payment_events',
          record: {
            id: 'payment-event-1',
            payload: { sensitive: 'not returned' },
          },
        },
      }),
      expectedSecret: 'secret',
      client: buildClient({}),
    });

    expect(result).toEqual({
      statusCode: 202,
      body: {
        ok: true,
        status: 'skipped',
        skipped: 1,
        error: {
          code: 'UNSUPPORTED_SOURCE_TABLE',
          message: 'Source table payment_events is not supported by Phase 1 sync.',
          ok: false,
          retryable: false,
          sourceTable: 'payment_events',
          sourceRecordId: 'payment-event-1',
        },
      },
    });
    expect(JSON.stringify(result)).not.toContain('not returned');
  });

  it('performs an idempotent create through the shared mapper and upsert path', async () => {
    const client = buildClient({
      queryResults: [
        { xopureSyncMaps: { edges: [] } },
        { xopureProducts: { edges: [] } },
      ],
      mutationResults: [
        { createXopureProduct: { id: 'twenty-product-1' } },
        { createXopureSyncMap: { id: 'sync-map-1' } },
      ],
    });

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'secret',
        body: {
          type: 'INSERT',
          schema: 'public',
          table: 'products',
          record: {
            id: 'product-1',
            sku: 'XO-PEP',
            name: 'Peptide Serum',
            price_cents: 12900,
            active: true,
            updated_at: '2026-05-01T00:00:00.000Z',
          },
        },
      }),
      expectedSecret: 'secret',
      client,
    });

    expect(result).toMatchObject({
      statusCode: 200,
      body: {
        ok: true,
        status: 'created',
        created: 1,
        updated: 0,
        skipped: 0,
        failed: 0,
        sourceTable: 'products',
        sourceRecordId: 'product-1',
        targetObject: 'xopureProduct',
        twentyRecordId: 'twenty-product-1',
      },
    });
    expect(JSON.stringify(result)).not.toContain('nextStep');
  });

  it('records row-level failures as retryable visible state', async () => {
    const client = buildClient({
      queryResults: [
        { xopureOrders: { edges: [] } },
        { xopureProducts: { edges: [{ node: { id: 'twenty-product-1' } }] } },
        { xopureSyncMaps: { edges: [] } },
      ],
      mutationResults: [{ createXopureSyncMap: { id: 'sync-map-failed' } }],
    });

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'secret',
        body: {
          type: 'INSERT',
          schema: 'public',
          table: 'order_items',
          record: {
            id: 'line-1',
            order_id: 'missing-order',
            product_id: 'product-1',
            sku: 'XO-PEP',
            name: 'Peptide Serum',
            quantity: 1,
            unit_price_cents: 12900,
            line_total_cents: 12900,
          },
        },
      }),
      expectedSecret: 'secret',
      client,
    });

    expect(result).toMatchObject({
      statusCode: 409,
      body: {
        ok: false,
        status: 'failed',
        failed: 1,
        error: {
          code: 'MISSING_REQUIRED_RELATION',
          retryable: true,
        },
        syncMapId: 'sync-map-failed',
      },
    });
  });
});
