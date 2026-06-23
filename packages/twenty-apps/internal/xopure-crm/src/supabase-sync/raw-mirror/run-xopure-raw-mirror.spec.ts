import { describe, expect, it, vi } from 'vitest';

import {
  buildRawMirrorRecord,
  discoverRawMirrorTables,
  discoverRawMirrorRestTables,
  getRawMirrorTargetTableName,
  persistRawMirrorRecords,
  readRawMirrorRestTableRows,
  runXopureRawMirrorLive,
  runXopureRawMirrorDryRun,
  verifyRawMirrorParity,
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

  it('derives a stable content-key source id for rows without an id column', () => {
    const first = buildRawMirrorRecord(
      {
        sourceSchema: 'public',
        sourceTable: 'site_settings',
        targetTableName: '_xopureRaw_site_settings',
      },
      { value: 'enabled', key: 'support_console' },
    );
    const second = buildRawMirrorRecord(
      {
        sourceSchema: 'public',
        sourceTable: 'site_settings',
        targetTableName: '_xopureRaw_site_settings',
      },
      { key: 'support_console', value: 'enabled' },
    );

    expect(first.sourceRecordId).toMatch(/^content:/);
    expect(first.sourceRecordId).toBe(second.sourceRecordId);
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

describe('raw mirror live persistence', () => {
  it('creates raw target definitions and upserts raw rows plus sync hashes', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [], rowCount: 1 });
    const record = buildRawMirrorRecord(
      {
        sourceSchema: 'public',
        sourceTable: 'payments',
        targetTableName: '_xopureRaw_payments',
      },
      { id: 'payment-1', amount_cents: 12900 },
    );

    const result = await persistRawMirrorRecords({
      client: { query },
      workspaceSchema: 'workspace_abc123',
      records: [record],
      syncedAt: '2026-06-22T21:00:00Z',
    });

    expect(result).toEqual({ upserted: 1 });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('"workspace_abc123"."_xopureSyncHash"'),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('"workspace_abc123"."_xopureRaw_payments"'),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO "workspace_abc123"."_xopureRaw_payments"'),
      [
        'public',
        'payments',
        'payment-1',
        JSON.stringify({ id: 'payment-1', amount_cents: 12900 }),
        record.contentHash,
        '2026-06-22T21:00:00Z',
      ],
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO "workspace_abc123"."_xopureSyncHash"'),
      [
        'public',
        'payments',
        'payment-1',
        '_xopureRaw_payments',
        record.contentHash,
        '2026-06-22T21:00:00Z',
      ],
    );
  });

  it('rejects unsafe workspace schemas before issuing SQL', async () => {
    const query = vi.fn();

    await expect(
      persistRawMirrorRecords({
        client: { query },
        workspaceSchema: 'public;drop',
        records: [],
      }),
    ).rejects.toThrow('TWENTY_WORKSPACE_SCHEMA');

    expect(query).not.toHaveBeenCalled();
  });

  it('persists rows without conventional ids using content-key source ids', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [], rowCount: 1 });

    const result = await runXopureRawMirrorLive({
      discoverTables: async () => [
        {
          sourceSchema: 'public',
          sourceTable: 'payments',
          targetTableName: '_xopureRaw_payments',
        },
      ],
      readTableRows: async () => [
        { id: 'payment-1', amount_cents: 12900 },
        { event_name: 'missing-id' },
      ],
      target: {
        client: { query },
        workspaceSchema: 'workspace_abc123',
        syncedAt: '2026-06-22T21:00:00Z',
      },
    });

    expect(result).toMatchObject({
      dryRun: false,
      tableCount: 1,
      scanned: 2,
      hashed: 2,
      upserted: 2,
      failed: 0,
    });
    expect(result.errors).toEqual([]);
  });
});

describe('raw mirror parity verification', () => {
  it('compares source hashes against persisted sync hashes', async () => {
    const sourceTable = {
      sourceSchema: 'public',
      sourceTable: 'payments',
      targetTableName: '_xopureRaw_payments',
    };
    const matchingRecord = buildRawMirrorRecord(sourceTable, {
      id: 'payment-1',
      amount_cents: 12900,
    });
    const changedRecord = buildRawMirrorRecord(sourceTable, {
      id: 'payment-2',
      amount_cents: 2500,
    });
    const missingRecord = buildRawMirrorRecord(sourceTable, {
      id: 'payment-3',
      amount_cents: 3300,
    });
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          sourceSchema: 'public',
          sourceTable: 'payments',
          sourceRecordId: 'payment-1',
          targetTableName: '_xopureRaw_payments',
          contentHash: matchingRecord.contentHash,
        },
        {
          sourceSchema: 'public',
          sourceTable: 'payments',
          sourceRecordId: 'payment-2',
          targetTableName: '_xopureRaw_payments',
          contentHash: 'stale-hash',
        },
        {
          sourceSchema: 'public',
          sourceTable: 'payments',
          sourceRecordId: 'payment-deleted',
          targetTableName: '_xopureRaw_payments',
          contentHash: 'old-hash',
        },
        {
          sourceSchema: 'public',
          sourceTable: 'affiliates',
          sourceRecordId: 'affiliate-1',
          targetTableName: '_xopureRaw_affiliates',
          contentHash: 'other-table-hash',
        },
      ],
    });

    const result = await verifyRawMirrorParity({
      discoverTables: async () => [sourceTable],
      readTableRows: async () => [
        matchingRecord.payload,
        changedRecord.payload,
        missingRecord.payload,
      ],
      target: {
        client: { query },
        workspaceSchema: 'workspace_abc123',
      },
    });

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('FROM "workspace_abc123"."_xopureSyncHash"'),
    );
    expect(result).toMatchObject({
      verified: false,
      tableCount: 1,
      sourceScanned: 3,
      sourceHashed: 3,
      stored: 3,
      matching: 1,
      missing: 1,
      changed: 1,
      deleted: 1,
      failed: 0,
    });
    expect(result.missingRecords).toEqual([
      {
        sourceSchema: 'public',
        sourceTable: 'payments',
        sourceRecordId: 'payment-3',
        targetTableName: '_xopureRaw_payments',
      },
    ]);
    expect(result.changedRecords).toEqual([
      {
        sourceSchema: 'public',
        sourceTable: 'payments',
        sourceRecordId: 'payment-2',
        targetTableName: '_xopureRaw_payments',
      },
    ]);
    expect(result.deletedRecords).toEqual([
      {
        sourceSchema: 'public',
        sourceTable: 'payments',
        sourceRecordId: 'payment-deleted',
        targetTableName: '_xopureRaw_payments',
      },
    ]);
  });
});
