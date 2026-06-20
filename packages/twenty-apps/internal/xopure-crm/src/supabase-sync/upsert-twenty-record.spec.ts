import { describe, expect, it, vi } from 'vitest';

import type { MappedSourceRecord } from './types/mapped-source-record.type';
import { upsertTwentyRecord } from './utils/upsert-twenty-record';

const buildRecord = (
  overrides: Partial<MappedSourceRecord> = {},
): MappedSourceRecord => ({
  sourceSystem: 'supabase',
  sourceSchema: 'public',
  sourceTable: 'products',
  sourceRecordId: 'product-1',
  syncKey: 'supabase.public.products.product-1',
  targetObject: 'xopureProduct',
  externalIdField: 'supabaseProductId',
  externalIdValue: 'product-1',
  fieldValues: {
    name: 'Peptide Serum',
    supabaseProductId: 'product-1',
    priceCents: 12900,
  },
  relations: [],
  contentHash: 'hash-1',
  ...overrides,
});

type FakeQueryResult = Record<string, unknown>;

type FakeMutationResult = Record<string, unknown>;

const buildClient = (params: {
  queryResults?: FakeQueryResult[];
  mutationResults?: FakeMutationResult[];
}) => {
  const queryResults = [...(params.queryResults ?? [])];
  const mutationResults = [...(params.mutationResults ?? [])];

  return {
    query: vi.fn<(...args: Array<Record<string, unknown>>) => Promise<Record<string, unknown>>>(async () => queryResults.shift() ?? {}),
    mutation: vi.fn<(...args: Array<Record<string, unknown>>) => Promise<Record<string, unknown>>>(async () => mutationResults.shift() ?? {}),
  };
};

describe('upsertTwentyRecord', () => {
  it('creates a target record and sync map when no existing record is found', async () => {
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

    const result = await upsertTwentyRecord(client, buildRecord());

    expect(result).toEqual({
      action: 'created',
      targetObject: 'xopureProduct',
      twentyRecordId: 'twenty-product-1',
      syncMapId: 'sync-map-1',
    });
    expect(client.mutation.mock.calls[0]?.[0]).toEqual({
      createXopureProduct: {
        __args: {
          data: {
            name: 'Peptide Serum',
            supabaseProductId: 'product-1',
            priceCents: 12900,
          },
        },
        id: true,
      },
    });
    expect(client.mutation.mock.calls[1]?.[0]).toMatchObject({
      createXopureSyncMap: {
        __args: {
          data: {
            syncKey: 'supabase.public.products.product-1',
            sourceSystem: 'supabase',
            sourceSchema: 'public',
            sourceTable: 'products',
            sourceRecordId: 'product-1',
            targetObject: 'xopureProduct',
            targetRecordId: 'twenty-product-1',
            payloadHash: 'hash-1',
            lastStatus: 'SYNCED',
          },
        },
        id: true,
      },
    });
  });

  it('updates the mapped target record on duplicate delivery', async () => {
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

    const result = await upsertTwentyRecord(client, buildRecord());

    expect(result.action).toBe('updated');
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.mutation.mock.calls[0]?.[0]).toEqual({
      updateXopureProduct: {
        __args: {
          id: 'twenty-product-1',
          data: {
            name: 'Peptide Serum',
            priceCents: 12900,
          },
        },
        id: true,
      },
    });
  });

  it('skips target update when the sanitized payload hash is unchanged', async () => {
    const client = buildClient({
      queryResults: [
        {
          xopureSyncMaps: {
            edges: [
              {
                node: {
                  id: 'sync-map-1',
                  targetRecordId: 'twenty-product-1',
                  payloadHash: 'hash-1',
                },
              },
            ],
          },
        },
      ],
      mutationResults: [{ updateXopureSyncMap: { id: 'sync-map-1' } }],
    });

    const result = await upsertTwentyRecord(client, buildRecord());

    expect(result.action).toBe('skipped');
    expect(client.mutation).toHaveBeenCalledTimes(1);
    expect(client.mutation.mock.calls[0]?.[0]).toMatchObject({
      updateXopureSyncMap: {
        __args: {
          id: 'sync-map-1',
          data: {
            lastStatus: 'SYNCED',
          },
        },
      },
    });
  });

  it('records a retryable failure instead of upserting when a required relation is missing', async () => {
    const record = buildRecord({
      sourceTable: 'order_items',
      sourceRecordId: 'line-1',
      syncKey: 'supabase.public.order_items.line-1',
      targetObject: 'xopureOrderLine',
      externalIdField: 'supabaseOrderItemId',
      externalIdValue: 'line-1',
      fieldValues: {
        name: 'Peptide Serum',
        supabaseOrderItemId: 'line-1',
      },
      relations: [
        {
          fieldName: 'order',
          relationIdFieldName: 'orderId',
          targetObject: 'xopureOrder',
          externalIdField: 'supabaseOrderId',
          externalIdValue: 'missing-order',
          required: true,
        },
      ],
    });
    const client = buildClient({
      queryResults: [
        { xopureOrders: { edges: [] } },
        { xopureSyncMaps: { edges: [] } },
      ],
      mutationResults: [{ createXopureSyncMap: { id: 'sync-map-failed' } }],
    });

    const result = await upsertTwentyRecord(client, record);

    expect(result).toMatchObject({
      action: 'failed',
      retryable: true,
      errorCode: 'MISSING_REQUIRED_RELATION',
      syncMapId: 'sync-map-failed',
    });
    expect(client.mutation).toHaveBeenCalledTimes(1);
    expect(client.mutation.mock.calls[0]?.[0]).toMatchObject({
      createXopureSyncMap: {
        __args: {
          data: {
            lastStatus: 'FAILED_RETRYABLE',
          },
        },
      },
    });
  });

  it('creates a referral relationship with sponsor and sponsored relation ids', async () => {
    const record = buildRecord({
      sourceTable: 'affiliates',
      sourceRecordId: 'referral:ambassador-parent:ambassador-child',
      syncKey:
        'supabase.public.affiliates.referral:ambassador-parent:ambassador-child',
      targetObject: 'xopureReferralRelationship',
      externalIdField: 'relationshipKey',
      externalIdValue: 'ambassador-parent:ambassador-child',
      fieldValues: {
        relationshipKey: 'ambassador-parent:ambassador-child',
        name: 'ambassador-parent → Child Ambassador',
        sponsorAmbassadorExternalId: 'ambassador-parent',
        sponsoredAmbassadorExternalId: 'ambassador-child',
        depth: 1,
        isActive: true,
      },
      relations: [
        {
          fieldName: 'sponsor',
          relationIdFieldName: 'sponsorId',
          targetObject: 'xopureAmbassador',
          externalIdField: 'supabaseAmbassadorId',
          externalIdValue: 'ambassador-parent',
          required: true,
        },
        {
          fieldName: 'sponsored',
          relationIdFieldName: 'sponsoredId',
          targetObject: 'xopureAmbassador',
          externalIdField: 'supabaseAmbassadorId',
          externalIdValue: 'ambassador-child',
          required: true,
        },
      ],
    });
    const client = buildClient({
      queryResults: [
        { xopureAmbassadors: { edges: [{ node: { id: 'parent-id' } }] } },
        { xopureAmbassadors: { edges: [{ node: { id: 'child-id' } }] } },
        { xopureSyncMaps: { edges: [] } },
        { xopureReferralRelationships: { edges: [] } },
      ],
      mutationResults: [
        {
          createXopureReferralRelationship: {
            id: 'referral-relationship-id',
          },
        },
        { createXopureSyncMap: { id: 'sync-map-relationship' } },
      ],
    });

    const result = await upsertTwentyRecord(client, record);

    expect(result).toEqual({
      action: 'created',
      targetObject: 'xopureReferralRelationship',
      twentyRecordId: 'referral-relationship-id',
      syncMapId: 'sync-map-relationship',
    });
    expect(client.mutation.mock.calls[0]?.[0]).toEqual({
      createXopureReferralRelationship: {
        __args: {
          data: {
            relationshipKey: 'ambassador-parent:ambassador-child',
            name: 'ambassador-parent → Child Ambassador',
            sponsorAmbassadorExternalId: 'ambassador-parent',
            sponsoredAmbassadorExternalId: 'ambassador-child',
            depth: 1,
            isActive: true,
            sponsorId: 'parent-id',
            sponsoredId: 'child-id',
          },
        },
        id: true,
      },
    });
  });
});
