import { describe, expect, it, vi } from 'vitest';

import { handleSupabaseSyncWebhook } from './supabase-sync-webhook-handler';
import { mapSupabaseRecords } from '../../supabase-sync/utils/map-supabase-record';

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
    query: vi.fn<(...args: Array<Record<string, unknown>>) => Promise<Record<string, unknown>>>(async () => queryResults.shift() ?? {}),
    mutation: vi.fn<(...args: Array<Record<string, unknown>>) => Promise<Record<string, unknown>>>(async () => mutationResults.shift() ?? {}),
  };
};

const buildOrderRecordWithPaymentFields = () => ({
  id: 'order-1',
  commerce_order_id: 'commerce-order-1',
  fulfillment_status: 'fulfilled',
  subtotal_cents: 10_000,
  total_cents: 12_900,
  payment_gateway: 'stripe',
  payment_status: 'succeeded',
  payment_method_code: 'card',
  currency: 'USD',
  updated_at: '2026-05-01T00:00:00.000Z',
  internal_note: 'do-not-echo',
});

const buildPaymentRecordFromOrderForTest = (
  record: Record<string, unknown>,
): Record<string, unknown> => ({
  ...record,
  order_id: record.order_id ?? record.id,
  provider: record.payment_gateway ?? record.payment_method_code,
  method_code: record.payment_method_code ?? record.payment_gateway,
  amount_cents: record.total_cents ?? record.subtotal_cents,
  status: record.payment_status,
  ...(Object.prototype.hasOwnProperty.call(record, 'refund_amount_cents')
    ? { refund_amount_cents: record.refund_amount_cents }
    : {}),
});

const getMappedContentHash = (params: {
  sourceTable: string;
  record: Record<string, unknown>;
}) => {
  const result = mapSupabaseRecords({
    eventType: 'UPDATE',
    sourceSchema: 'public',
    sourceTable: params.sourceTable,
    record: params.record,
  })[0];

  if (!result) {
    throw new Error(`No mapping result for ${params.sourceTable}`);
  }

  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.record.contentHash;
};

describe('handleSupabaseSyncWebhook', () => {
  it('rejects requests when expectedSecret is not configured (undefined)', async () => {
    const client = buildClient({});

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'any-secret',
        body: { table: 'products', record: { id: 'product-1' } },
      }),
      expectedSecret: undefined,
      client,
    });

    expect(result).toEqual({
      statusCode: 500,
      body: {
        ok: false,
        error: {
          code: 'SYNC_SECRET_NOT_CONFIGURED',
          message: 'Sync secret is not configured. Refusing to process request.',
          retryable: true,
        },
      },
    });
    expect(client.query).not.toHaveBeenCalled();
    expect(client.mutation).not.toHaveBeenCalled();
  });

  it('rejects requests when expectedSecret is blank (empty string)', async () => {
    const client = buildClient({});

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'any-secret',
        body: { table: 'products', record: { id: 'product-1' } },
      }),
      expectedSecret: '',
      client,
    });

    expect(result).toEqual({
      statusCode: 500,
      body: {
        ok: false,
        error: {
          code: 'SYNC_SECRET_NOT_CONFIGURED',
          message: 'Sync secret is not configured. Refusing to process request.',
          retryable: true,
        },
      },
    });
    expect(client.query).not.toHaveBeenCalled();
    expect(client.mutation).not.toHaveBeenCalled();
  });

  it('rejects requests when expectedSecret is whitespace-only', async () => {
    const client = buildClient({});

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'any-secret',
        body: { table: 'products', record: { id: 'product-1' } },
      }),
      expectedSecret: '   ',
      client,
    });

    expect(result).toEqual({
      statusCode: 500,
      body: {
        ok: false,
        error: {
          code: 'SYNC_SECRET_NOT_CONFIGURED',
          message: 'Sync secret is not configured. Refusing to process request.',
          retryable: true,
        },
      },
    });
    expect(client.query).not.toHaveBeenCalled();
    expect(client.mutation).not.toHaveBeenCalled();
  });

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

  it('fans out orders webhooks with payment fields into order and payment creates', async () => {
    const orderRecord = buildOrderRecordWithPaymentFields();
    const client = buildClient({
      queryResults: [
        { xopureSyncMaps: { edges: [] } },
        { xopureOrders: { edges: [] } },
        { xopureSyncMaps: { edges: [] } },
        { xopureOrders: { edges: [{ node: { id: 'twenty-order-1' } }] } },
        { xopureSyncMaps: { edges: [] } },
        { xopurePayments: { edges: [] } },
        { xopureSyncMaps: { edges: [] } },
      ],
      mutationResults: [
        { createXopureOrder: { id: 'twenty-order-1' } },
        { createXopureSyncMap: { id: 'sync-map-order' } },
        { createXopurePayment: { id: 'twenty-payment-1' } },
        { createXopureSyncMap: { id: 'sync-map-payment' } },
      ],
    });

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'secret',
        body: {
          type: 'INSERT',
          schema: 'public',
          table: 'orders',
          record: orderRecord,
        },
      }),
      expectedSecret: 'secret',
      client,
    });

    expect(result).toMatchObject({
      statusCode: 200,
      body: {
        ok: true,
        status: 'processed',
        created: 2,
        updated: 0,
        skipped: 0,
        failed: 0,
        sourceTable: 'orders',
        sourceRecordId: 'order-1',
        targetObject: 'xopureOrder',
        targetObjects: ['xopureOrder', 'xopurePayment'],
        twentyRecordId: 'twenty-order-1',
      },
    });
    expect(client.mutation.mock.calls[0]?.[0]).toHaveProperty('createXopureOrder');
    expect(client.mutation.mock.calls[2]?.[0]).toMatchObject({
      createXopurePayment: {
        __args: {
          data: {
            supabasePaymentId: 'order-1',
            orderExternalId: 'order-1',
            provider: 'stripe',
            methodCode: 'card',
            amountCents: 12_900,
            status: 'SUCCEEDED',
            orderId: 'twenty-order-1',
          },
        },
      },
    });
    expect(JSON.stringify(result)).not.toContain('do-not-echo');
  });

  it('fans out orders webhooks with payment fields into order and payment updates', async () => {
    const orderRecord = buildOrderRecordWithPaymentFields();
    const client = buildClient({
      queryResults: [
        {
          xopureSyncMaps: {
            edges: [
              {
                node: {
                  id: 'sync-map-order',
                  targetRecordId: 'twenty-order-1',
                  payloadHash: 'stale-order-hash',
                },
              },
            ],
          },
        },
        { xopureOrders: { edges: [{ node: { id: 'twenty-order-1' } }] } },
        {
          xopureSyncMaps: {
            edges: [
              {
                node: {
                  id: 'sync-map-payment',
                  targetRecordId: 'twenty-payment-1',
                  payloadHash: 'stale-payment-hash',
                },
              },
            ],
          },
        },
      ],
      mutationResults: [
        { updateXopureOrder: { id: 'twenty-order-1' } },
        { updateXopureSyncMap: { id: 'sync-map-order' } },
        { updateXopurePayment: { id: 'twenty-payment-1' } },
        { updateXopureSyncMap: { id: 'sync-map-payment' } },
      ],
    });

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'secret',
        body: {
          type: 'UPDATE',
          schema: 'public',
          table: 'orders',
          record: orderRecord,
        },
      }),
      expectedSecret: 'secret',
      client,
    });

    expect(result).toMatchObject({
      statusCode: 200,
      body: {
        ok: true,
        status: 'processed',
        created: 0,
        updated: 2,
        skipped: 0,
        failed: 0,
        targetObject: 'xopureOrder',
        targetObjects: ['xopureOrder', 'xopurePayment'],
      },
    });
    expect(client.mutation.mock.calls[0]?.[0]).toHaveProperty('updateXopureOrder');
    expect(client.mutation.mock.calls[2]?.[0]).toHaveProperty('updateXopurePayment');
  });

  it('fans out orders webhooks with payment fields into order and payment skips', async () => {
    const orderRecord = buildOrderRecordWithPaymentFields();
    const paymentRecord = buildPaymentRecordFromOrderForTest(orderRecord);
    const client = buildClient({
      queryResults: [
        {
          xopureSyncMaps: {
            edges: [
              {
                node: {
                  id: 'sync-map-order',
                  targetRecordId: 'twenty-order-1',
                  payloadHash: getMappedContentHash({
                    sourceTable: 'orders',
                    record: orderRecord,
                  }),
                },
              },
            ],
          },
        },
        { xopureOrders: { edges: [{ node: { id: 'twenty-order-1' } }] } },
        {
          xopureSyncMaps: {
            edges: [
              {
                node: {
                  id: 'sync-map-payment',
                  targetRecordId: 'twenty-payment-1',
                  payloadHash: getMappedContentHash({
                    sourceTable: 'payments',
                    record: paymentRecord,
                  }),
                },
              },
            ],
          },
        },
      ],
      mutationResults: [
        { updateXopureSyncMap: { id: 'sync-map-order' } },
        { updateXopureSyncMap: { id: 'sync-map-payment' } },
      ],
    });

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'secret',
        body: {
          type: 'UPDATE',
          schema: 'public',
          table: 'orders',
          record: orderRecord,
        },
      }),
      expectedSecret: 'secret',
      client,
    });

    expect(result).toMatchObject({
      statusCode: 200,
      body: {
        ok: true,
        status: 'processed',
        created: 0,
        updated: 0,
        skipped: 2,
        failed: 0,
        targetObject: 'xopureOrder',
        targetObjects: ['xopureOrder', 'xopurePayment'],
      },
    });
    expect(client.mutation).toHaveBeenCalledTimes(2);
    expect(client.mutation.mock.calls[0]?.[0]).toHaveProperty('updateXopureSyncMap');
    expect(client.mutation.mock.calls[1]?.[0]).toHaveProperty('updateXopureSyncMap');
  });

  it('maps orders webhooks without payment fields only as orders', async () => {
    const client = buildClient({
      queryResults: [
        { xopureSyncMaps: { edges: [] } },
        { xopureOrders: { edges: [] } },
        { xopureSyncMaps: { edges: [] } },
      ],
      mutationResults: [
        { createXopureOrder: { id: 'twenty-order-1' } },
        { createXopureSyncMap: { id: 'sync-map-order' } },
      ],
    });

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'secret',
        body: {
          type: 'INSERT',
          schema: 'public',
          table: 'orders',
          record: {
            id: 'order-without-payment',
            commerce_order_id: 'commerce-order-without-payment',
            fulfillment_status: 'pending',
            currency: 'USD',
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
        sourceTable: 'orders',
        sourceRecordId: 'order-without-payment',
        targetObject: 'xopureOrder',
        targetObjects: ['xopureOrder'],
      },
    });
    expect(JSON.stringify(client.query.mock.calls)).not.toContain('xopurePayments');
  });

  it('mirrors affiliate downline relationships after the ambassador upsert', async () => {
    const client = buildClient({
      queryResults: [
        { xopureSyncMaps: { edges: [] } },
        { xopureAmbassadors: { edges: [] } },
        { xopureSyncMaps: { edges: [] } },
        { xopureAmbassadors: { edges: [{ node: { id: 'parent-id' } }] } },
        { xopureAmbassadors: { edges: [{ node: { id: 'child-id' } }] } },
        { xopureSyncMaps: { edges: [] } },
        { xopureReferralRelationships: { edges: [] } },
        { xopureSyncMaps: { edges: [] } },
      ],
      mutationResults: [
        { createXopureAmbassador: { id: 'child-id' } },
        { createXopureSyncMap: { id: 'sync-map-ambassador' } },
        {
          createXopureReferralRelationship: {
            id: 'relationship-id',
          },
        },
        { createXopureSyncMap: { id: 'sync-map-relationship' } },
      ],
    });

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'secret',
        body: {
          type: 'INSERT',
          schema: 'public',
          table: 'affiliates',
          record: {
            id: 'ambassador-child',
            parent_id: 'ambassador-parent',
            name: 'Child Ambassador',
            email: 'child@example.test',
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
        status: 'processed',
        created: 2,
        updated: 0,
        skipped: 0,
        failed: 0,
        sourceTable: 'affiliates',
        sourceRecordId: 'ambassador-child',
        targetObject: 'xopureAmbassador',
        targetObjects: [
          'xopureAmbassador',
          'xopureReferralRelationship',
        ],
      },
    });
    expect(client.mutation.mock.calls[2]?.[0]).toMatchObject({
      createXopureReferralRelationship: {
        __args: {
          data: {
            relationshipKey: 'ambassador-parent:ambassador-child',
            sponsorId: 'parent-id',
            sponsoredId: 'child-id',
          },
        },
      },
    });
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

  it('tombstones a DELETE webhook for a record with an existing sync map', async () => {
    const client = buildClient({
      queryResults: [
        {
          xopureSyncMaps: {
            edges: [
              {
                node: {
                  id: 'sync-map-1',
                  targetRecordId: 'twenty-product-1',
                  payloadHash: 'stale',
                },
              },
      ],
          },
        },
      ],
      mutationResults: [
        { updateXopureSyncMap: { id: 'sync-map-1' } },
      ],
    });

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'secret',
        body: {
          type: 'DELETE',
          schema: 'public',
          table: 'products',
          old_record: {
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
        status: 'tombstoned',
        tombstoned: 1,
        sourceTable: 'products',
        sourceRecordId: 'product-1',
      },
    });
    // No target-object create/update — DELETED sync map is the only mutation
    const mutationCalls = client.mutation.mock.calls;
    expect(mutationCalls).toHaveLength(1);
    expect(mutationCalls[0]?.[0]).toMatchObject({
      updateXopureSyncMap: {
        __args: {
          data: {
            lastStatus: 'DELETED',
          },
        },
      },
    });
  });

  it('skips DELETE webhook when no sync map exists for the record', async () => {
    const client = buildClient({
      queryResults: [
        { xopureSyncMaps: { edges: [] } },
      ],
      mutationResults: [],
    });

    const result = await handleSupabaseSyncWebhook({
      event: buildEvent({
        secret: 'secret',
        body: {
          type: 'DELETE',
          schema: 'public',
          table: 'products',
          old_record: {
            id: 'product-ghost',
            sku: 'XO-GHOST',
            name: 'Ghost Product',
            price_cents: 5000,
            active: false,
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
        status: 'tombstoned',
        tombstoned: 0,
        sourceTable: 'products',
        sourceRecordId: 'product-ghost',
      },
    });
    // No mutations at all — no target write, no sync map write
    expect(client.mutation).not.toHaveBeenCalled();
  });
});
