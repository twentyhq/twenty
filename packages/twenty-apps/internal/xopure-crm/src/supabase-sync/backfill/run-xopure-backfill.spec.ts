import { describe, expect, it, vi } from 'vitest';

import type {
  MappedSourceRecord,
  SupportedSourceTable,
} from '../types/mapped-source-record.type';
import type { BackfillErrorEntry } from './run-xopure-backfill';
import { BACKFILL_SOURCE_ORDER } from './backfill-runner';
import { runXopureBackfill } from './run-xopure-backfill';
import { mapSupabaseRecord } from '../utils/map-supabase-record';

type FakeQueryResult = Record<string, unknown>;

type FakeMutationResult = Record<string, unknown>;

const buildClient = (params: {
  queryResults?: FakeQueryResult[];
  mutationResults?: FakeMutationResult[];
}) => {
  const queryResults = [...(params.queryResults ?? [])];
  const mutationResults = [...(params.mutationResults ?? [])];

  return {
    query: vi.fn(async () => queryResults.shift() ?? {}),
    mutation: vi.fn(async () => mutationResults.shift() ?? {}),
  };
};

const makeReader = (
  rowsByTable: Partial<Record<SupportedSourceTable, Array<Record<string, unknown>>>>,
) =>
  vi.fn(async (sourceTable: SupportedSourceTable) => rowsByTable[sourceTable] ?? []);

const assertDryRunDefaults = (result: Record<string, unknown>) => {
  expect(result).toMatchObject({
    dryRun: true,
    created: 0,
    updated: 0,
    skipped: 0,
  });
};

describe('runXopureBackfill', () => {
  describe('dry-run mode', () => {
    it('scans rows from the reader, maps them, and returns records without calling client.mutation', async () => {
      const readSourceBatch = makeReader({
        products: [
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
        ],
        orders: [
          {
            id: 'order-1',
            user_email: 'customer@example.test',
            subtotal_cents: 1000,
            total_cents: 1000,
            payment_status: 'paid',
            created_at: '2026-05-03T00:00:00.000Z',
            updated_at: '2026-05-03T00:00:00.000Z',
          },
        ],
      });
      const client = buildClient({});

      const result = await runXopureBackfill({
        sourceTables: ['orders', 'products'],
        readSourceBatch,
        client,
        dryRun: true,
      });

      assertDryRunDefaults(result);
      expect(result.dryRun).toBe(true);
      expect(result.scanned).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.records).toBeDefined();
      expect(Array.isArray(result.records)).toBe(true);
      expect(result.records).toHaveLength(3);
      expect(
        result.records!.map((record: MappedSourceRecord) => record.syncKey),
      ).toEqual([
        'supabase.public.products.product-a',
        'supabase.public.products.product-b',
        'supabase.public.orders.order-1',
      ]);
      expect(readSourceBatch.mock.calls.map((call: unknown[]) => call[0])).toEqual([
        'products',
        'orders',
      ]);
      expect(client.mutation).not.toHaveBeenCalled();
    });

    it('returns dryRun: true and does not mutate when dryRun is the default', async () => {
      const readSourceBatch = makeReader({
        products: [
          { id: 'p-1', sku: 'P1', name: 'Product', price_cents: 5000 },
        ],
      });
      const client = buildClient({});

      const result = await runXopureBackfill({
        sourceTables: ['products'],
        readSourceBatch,
        client,
      });

      assertDryRunDefaults(result);
      expect(result.dryRun).toBe(true);
      expect(client.mutation).not.toHaveBeenCalled();
    });

    it('reports mapping failures without aborting the batch', async () => {
      const readSourceBatch = makeReader({
        products: [
          { sku: 'NO-ID', name: 'Missing ID' },
          { id: 'product-1', sku: 'OK', name: 'Mapped', price_cents: 1000 },
        ],
      });
      const client = buildClient({});

      const result = await runXopureBackfill({
        sourceTables: ['products'],
        readSourceBatch,
        client,
        dryRun: true,
      });

      assertDryRunDefaults(result);
      expect(result.scanned).toBe(2);
      expect(result.mapped).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'MISSING_SOURCE_ID',
            sourceTable: 'products',
          }),
        ]),
      );
    });
  });

  describe('live mode (dryRun: false)', () => {
    it('upserts mapped records and returns created/updated/skipped/failed counts', async () => {
      const readSourceBatch = makeReader({
        products: [
          { id: 'product-1', sku: 'S1', name: 'Test Product', price_cents: 5000 },
        ],
      });
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

      const result = await runXopureBackfill({
        sourceTables: ['products'],
        readSourceBatch,
        client,
        dryRun: false,
      });

      expect(result.dryRun).toBe(false);
      expect(result.scanned).toBe(1);
      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.failed).toBe(0);
      expect(client.mutation).toHaveBeenCalled();
      expect(result.records).toBeUndefined();
    });

    it('correctly accumulates updated counts when existing records have changed payload', async () => {
      const readSourceBatch = makeReader({
        products: [
          { id: 'product-1', sku: 'S1', name: 'Updated Name', price_cents: 7500 },
        ],
      });
      const client = buildClient({
        queryResults: [
          {
            xopureSyncMaps: {
              edges: [
                {
                  node: {
                    id: 'sync-map-1',
                    targetRecordId: 'twenty-product-1',
                    payloadHash: 'old-hash',
                  },
                },
              ],
            },
          },
        ],
        mutationResults: [
          { updateXopureProduct: { id: 'twenty-product-1' } },
          { updateXopureSyncMap: { id: 'sync-map-1' } },
        ],
      });

      const result = await runXopureBackfill({
        sourceTables: ['products'],
        readSourceBatch,
        client,
        dryRun: false,
      });

      expect(result.updated).toBe(1);
      expect(result.created).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('correctly accumulates skipped counts when payload hash matches', async () => {
      const sourceRow = {
        id: 'product-1',
        sku: 'S1',
        name: 'Test Product',
        price_cents: 5000,
        updated_at: '2026-05-01T00:00:00.000Z',
      };
      const readSourceBatch = makeReader({
        products: [sourceRow],
      });
      const mappingResult = mapSupabaseRecord({
        eventType: 'BACKFILL',
        sourceSchema: 'public',
        sourceTable: 'products',
        record: sourceRow,
      });
      expect(mappingResult.ok).toBe(true);
      const fakeHash = (
        mappingResult as { ok: true; record: MappedSourceRecord }
      ).record.contentHash;
      const client = buildClient({
        queryResults: [
          {
            xopureSyncMaps: {
              edges: [
                {
                  node: {
                    id: 'sync-map-1',
                    targetRecordId: 'twenty-product-1',
                    payloadHash: fakeHash,
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

      const result = await runXopureBackfill({
        sourceTables: ['products'],
        readSourceBatch,
        client,
        dryRun: false,
      });

      expect(result.skipped).toBe(1);
      expect(result.created).toBe(0);
      expect(result.updated).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('continues after a row-level mapper failure and reports errors without raw payload data', async () => {
      const readSourceBatch = makeReader({
        products: [
          { sku: 'NO-ID', name: 'This row has no id field' },
          { id: 'product-2', sku: 'S2', name: 'Good Product', price_cents: 2500 },
        ],
      });
      const client = buildClient({
        queryResults: [
          { xopureSyncMaps: { edges: [] } },
          { xopureProducts: { edges: [] } },
        ],
        mutationResults: [
          { createXopureProduct: { id: 'twenty-product-2' } },
          { createXopureSyncMap: { id: 'sync-map-2' } },
        ],
      });

      const result = await runXopureBackfill({
        sourceTables: ['products'],
        readSourceBatch,
        client,
        dryRun: false,
      });

      expect(result.scanned).toBe(2);
      expect(result.created).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);

      const errorEntry = result.errors[0] as BackfillErrorEntry;
      expect(errorEntry).not.toHaveProperty('rawPayload');
      expect(errorEntry).not.toHaveProperty('raw');
      expect(errorEntry).not.toHaveProperty('payload');
      expect(errorEntry).toHaveProperty('sourceRecordId');
      expect(errorEntry).toHaveProperty('error');
      expect(typeof errorEntry.error).toBe('string');
    });

    it('continues after a row-level upsert failure and reports errors without raw payload data', async () => {
      const readSourceBatch = makeReader({
        order_items: [
          {
            id: 'line-1',
            order_id: 'missing-order',
            product_id: 'product-1',
            sku: 'S1',
            name: 'Line Item',
            quantity: 1,
            unit_price_cents: 1000,
            line_total_cents: 1000,
          },
          {
            id: 'line-2',
            order_id: 'order-1',
            product_id: 'product-1',
            sku: 'S2',
            name: 'Good Line',
            quantity: 2,
            unit_price_cents: 2000,
            line_total_cents: 4000,
          },
        ],
      });
      const client = buildClient({
        queryResults: [
          { xopureOrders: { edges: [] } },
          { xopureProducts: { edges: [] } },
          { xopureOrders: { edges: [{ node: { id: 'order-id-1' } }] } },
          { xopureProducts: { edges: [{ node: { id: 'product-id-1' } }] } },
          { xopureSyncMaps: { edges: [] } },
          { xopureOrderLines: { edges: [] } },
        ],
        mutationResults: [
          { createXopureSyncMap: { id: 'sync-map-failed-1' } },
          { createXopureOrderLine: { id: 'twenty-line-2' } },
          { createXopureSyncMap: { id: 'sync-map-ok-2' } },
        ],
      });

      const result = await runXopureBackfill({
        sourceTables: ['order_items'],
        readSourceBatch,
        client,
        dryRun: false,
      });

      expect(result.scanned).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.created).toBe(1);

      const errorEntries = result.errors.filter(
        (entry) => entry.sourceRecordId === 'line-1',
      );
      expect(errorEntries).toHaveLength(1);
      expect(errorEntries[0]).not.toHaveProperty('rawPayload');
      expect(errorEntries[0]).not.toHaveProperty('raw');
      expect(errorEntries[0]).not.toHaveProperty('payload');
    });
  });

  describe('table ordering', () => {
    it('processes tables in BACKFILL_SOURCE_ORDER regardless of input order', async () => {
      const readSourceBatch = makeReader({
        products: [{ id: 'p-1', sku: 'P', name: 'Product', price_cents: 1000 }],
        affiliates: [{ id: 'a-1', name: 'Ambassador', email: 'amb@test.test' }],
        orders: [{ id: 'o-1', user_email: 'c@test.test', subtotal_cents: 1000, total_cents: 1000 }],
        commission_ledger: [{ id: 'c-1', affiliate_id: 'a-1', amount_cents: 500 }],
      });
      const client = buildClient({});

      const result = await runXopureBackfill({
        sourceTables: ['commission_ledger', 'orders', 'affiliates', 'products'],
        readSourceBatch,
        client,
        dryRun: true,
      });

      const tablesRequested = readSourceBatch.mock.calls.map(
        (call: unknown[]) => call[0] as SupportedSourceTable,
      );
      expect(tablesRequested).toEqual([
        'products',
        'affiliates',
        'orders',
        'commission_ledger',
      ]);
      expect(tablesRequested).not.toEqual([
        'commission_ledger',
        'orders',
        'affiliates',
        'products',
      ]);
      expect(result.mapped).toBeGreaterThan(0);
    });

    it('defaults to all tables in BACKFILL_SOURCE_ORDER when sourceTables is empty', async () => {
      const readSourceBatch = makeReader({});
      const client = buildClient({});

      const result = await runXopureBackfill({
        sourceTables: [],
        readSourceBatch,
        client,
        dryRun: true,
      });

      const tablesRequested = readSourceBatch.mock.calls.map(
        (call: unknown[]) => call[0] as SupportedSourceTable,
      );
      expect(tablesRequested).toEqual(BACKFILL_SOURCE_ORDER);
      expect(result.scanned).toBe(0);
      expect(result.mapped).toBe(0);
    });
  });
});
