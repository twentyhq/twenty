import { describe, expect, it, vi } from 'vitest';

import {
  buildRawMirrorRecord,
  discoverRawMirrorTables,
  discoverRawMirrorRestTables,
  getRawMirrorTargetTableName,
  readRawMirrorRestTableRows,
  runXopureRawMirrorDryRun,
} from './run-xopure-raw-mirror';

describe('raw mirror table discovery', () => {
  it('discovers public base tables as raw mirror targets', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [
        { table_schema: 'public', table_name: 'orders' },
        { table_schema: 'public', table_name: 'payments' },
      ],
    });

    const tables = await discoverRawMirrorTables({ query });

    expect(query).toHaveBeenCalledWith(expect.stringContaining('information_schema.tables'), ['public']);
    expect(tables).toEqual([
      {
        sourceSchema: 'public',
        sourceTable: 'orders',
        targetTableName: '_xopureRaw_orders',
      },
      {
        sourceSchema: 'public',
        sourceTable: 'payments',
        targetTableName: '_xopureRaw_payments',
      },
    ]);
  });
});

describe('raw mirror REST fallback', () => {
  it('discovers exposed PostgREST table paths as raw mirror targets', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          paths: {
            '/payments': {},
            '/support_tickets': {},
            '/rpc/rebuild_cache': {},
            '/orders/{id}': {},
          },
        }),
      ),
    );

    const tables = await discoverRawMirrorRestTables({
      url: 'https://project.supabase.co',
      key: 'rest-secret',
      fetch: fetcher,
    });

    expect(fetcher).toHaveBeenCalledWith('https://project.supabase.co/rest/v1/', {
      method: 'GET',
      headers: expect.objectContaining({
        Accept: 'application/openapi+json',
        apikey: 'rest-secret',
        Authorization: 'Bearer rest-secret',
      }),
    });
    expect(tables).toEqual([
      {
        sourceSchema: 'public',
        sourceTable: 'payments',
        targetTableName: '_xopureRaw_payments',
      },
      {
        sourceSchema: 'public',
        sourceTable: 'support_tickets',
        targetTableName: '_xopureRaw_support_tickets',
      },
    ]);
  });

  it('reads REST table rows with range pagination', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([
        { id: 'payment-1' },
        { id: 'payment-2' },
      ])))
      .mockResolvedValueOnce(new Response(JSON.stringify([])));

    const rows = await readRawMirrorRestTableRows(
      {
        url: 'https://project.supabase.co/rest/v1',
        key: 'rest-secret',
        batchSize: 2,
        fetch: fetcher,
      },
      {
        sourceSchema: 'public',
        sourceTable: 'payments',
        targetTableName: '_xopureRaw_payments',
      },
    );

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      'https://project.supabase.co/rest/v1/payments?select=*',
      {
        method: 'GET',
        headers: expect.objectContaining({ Range: '0-1' }),
      },
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      'https://project.supabase.co/rest/v1/payments?select=*',
      {
        method: 'GET',
        headers: expect.objectContaining({ Range: '2-3' }),
      },
    );
    expect(rows).toEqual([{ id: 'payment-1' }, { id: 'payment-2' }]);
  });

  it('redacts REST URL and key from read errors', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'denied https://project.supabase.co/rest/v1/payments rest-secret',
        }),
        { status: 401 },
      ),
    );

    await expect(
      readRawMirrorRestTableRows(
        {
          url: 'https://project.supabase.co',
          key: 'rest-secret',
          fetch: fetcher,
        },
        {
          sourceSchema: 'public',
          sourceTable: 'payments',
          targetTableName: '_xopureRaw_payments',
        },
      ),
    ).rejects.toThrow('[REDACTED]');
  });
});

describe('raw mirror records', () => {
  it('builds stable raw mirror hashes without typed mapper fields', () => {
    const first = buildRawMirrorRecord(
      {
        sourceSchema: 'public',
        sourceTable: 'payments',
        targetTableName: '_xopureRaw_payments',
      },
      {
        id: 'payment-1',
        amount_cents: 12900,
        provider_payload: { z: 1, a: 2 },
      },
    );
    const second = buildRawMirrorRecord(
      {
        sourceSchema: 'public',
        sourceTable: 'payments',
        targetTableName: '_xopureRaw_payments',
      },
      {
        provider_payload: { a: 2, z: 1 },
        amount_cents: 12900,
        id: 'payment-1',
      },
    );

    expect(first).toMatchObject({
      sourceSchema: 'public',
      sourceTable: 'payments',
      sourceRecordId: 'payment-1',
      targetTableName: '_xopureRaw_payments',
      payload: {
        id: 'payment-1',
        amount_cents: 12900,
        provider_payload: { z: 1, a: 2 },
      },
    });
    expect(first.contentHash).toBe(second.contentHash);
  });

  it('rejects rows without a stable raw source id', () => {
    expect(() =>
      buildRawMirrorRecord(
        {
          sourceSchema: 'public',
          sourceTable: 'anonymous_events',
          targetTableName: '_xopureRaw_anonymous_events',
        },
        { event_name: 'viewed' },
      ),
    ).toThrow('stable source id');
  });

  it('derives raw table names deterministically', () => {
    expect(getRawMirrorTargetTableName('support_tickets')).toBe(
      '_xopureRaw_support_tickets',
    );
  });
});

describe('runXopureRawMirrorDryRun', () => {
  it('hashes every discovered raw table row in deterministic table order', async () => {
    const result = await runXopureRawMirrorDryRun({
      discoverTables: async () => [
        {
          sourceSchema: 'public',
          sourceTable: 'support_tickets',
          targetTableName: '_xopureRaw_support_tickets',
        },
        {
          sourceSchema: 'public',
          sourceTable: 'payments',
          targetTableName: '_xopureRaw_payments',
        },
      ],
      readTableRows: async (table) => {
        if (table.sourceTable === 'payments') {
          return [{ id: 'payment-1', amount_cents: 12900 }];
        }

        return [{ id: 'ticket-1', ticket_number: 'XO-1' }];
      },
    });

    expect(result).toMatchObject({
      dryRun: true,
      tableCount: 2,
      scanned: 2,
      hashed: 2,
      failed: 0,
    });
    expect(result.records.map((record) => record.targetTableName)).toEqual([
      '_xopureRaw_support_tickets',
      '_xopureRaw_payments',
    ]);
  });
});
