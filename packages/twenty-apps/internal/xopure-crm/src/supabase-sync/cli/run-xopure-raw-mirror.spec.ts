import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  discoverRawMirrorTables,
  discoverRawMirrorRestTables,
  readRawMirrorTableRows,
  readRawMirrorRestTableRows,
} from '../raw-mirror/run-xopure-raw-mirror';
import {
  executeXopureRawMirrorCli,
  redactRawMirrorCliError,
} from './run-xopure-raw-mirror';

vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(() => ({ query: vi.fn() })),
}));

vi.mock('../raw-mirror/run-xopure-raw-mirror', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../raw-mirror/run-xopure-raw-mirror')>();

  return {
    ...actual,
    discoverRawMirrorTables: vi.fn(),
    readRawMirrorTableRows: vi.fn(),
    discoverRawMirrorRestTables: vi.fn(),
    readRawMirrorRestTableRows: vi.fn(),
  };
});

const baseEnv = {
  XOPURE_SUPABASE_READONLY_DSN: 'postgres://readonly:secret@db.example.test/xopure',
};

const tables = [
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
];

describe('executeXopureRawMirrorCli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(discoverRawMirrorTables).mockResolvedValue(tables);
    vi.mocked(discoverRawMirrorRestTables).mockResolvedValue(tables);
    vi.mocked(readRawMirrorTableRows).mockImplementation(async (_pool, table) => {
      if (table.sourceTable === 'payments') {
        return [
          {
            id: 'payment-1',
            provider_payload: 'should-not-print',
          },
        ];
      }

      return [{ id: 'ticket-1', ticket_number: 'XO-1' }];
    });
    vi.mocked(readRawMirrorRestTableRows).mockImplementation(async (_opts, table) => {
      if (table.sourceTable === 'payments') {
        return [
          {
            id: 'payment-1',
            provider_payload: 'should-not-print',
          },
        ];
      }

      return [{ id: 'ticket-1', ticket_number: 'XO-1' }];
    });
  });

  it('defaults to dry-run and prints only summary fields', async () => {
    const output: string[] = [];

    await executeXopureRawMirrorCli([], {
      env: baseEnv,
      write: (chunk) => output.push(chunk),
    });

    expect(discoverRawMirrorTables).toHaveBeenCalledWith(expect.any(Object), 'public');
    expect(discoverRawMirrorRestTables).not.toHaveBeenCalled();
    expect(readRawMirrorTableRows).toHaveBeenCalledTimes(2);

    const text = output.join('');
    expect(text).not.toContain('should-not-print');
    expect(text).not.toContain('secret');
    expect(JSON.parse(text)).toEqual({
      dryRun: true,
      tableCount: 2,
      scanned: 2,
      hashed: 2,
      failed: 0,
      errors: [],
    });
  });

  it('filters discovered tables for a single source table', async () => {
    await executeXopureRawMirrorCli(['--source-table=support_tickets'], {
      env: baseEnv,
      write: () => undefined,
    });

    expect(readRawMirrorTableRows).toHaveBeenCalledTimes(1);
    expect(readRawMirrorTableRows).toHaveBeenCalledWith(
      expect.any(Object),
      {
        sourceSchema: 'public',
        sourceTable: 'support_tickets',
        targetTableName: '_xopureRaw_support_tickets',
      },
    );
  });

  it('falls back to REST discovery when the DSN is absent', async () => {
    const output: string[] = [];

    await executeXopureRawMirrorCli(['--source-table=support_tickets'], {
      env: {
        XOPURE_SUPABASE_READONLY_REST_URL: 'https://project.supabase.co',
        XOPURE_SUPABASE_READONLY_REST_KEY: 'rest-secret',
      },
      write: (chunk) => output.push(chunk),
    });

    expect(discoverRawMirrorTables).not.toHaveBeenCalled();
    expect(discoverRawMirrorRestTables).toHaveBeenCalledWith({
      url: 'https://project.supabase.co',
      key: 'rest-secret',
      schema: 'public',
    });
    expect(readRawMirrorRestTableRows).toHaveBeenCalledTimes(1);
    expect(JSON.parse(output.join(''))).toMatchObject({
      dryRun: true,
      tableCount: 1,
      scanned: 1,
      hashed: 1,
    });
  });

  it('prefers DSN discovery when both DSN and REST env vars exist', async () => {
    await executeXopureRawMirrorCli([], {
      env: {
        ...baseEnv,
        XOPURE_SUPABASE_READONLY_REST_URL: 'https://project.supabase.co',
        XOPURE_SUPABASE_READONLY_REST_KEY: 'rest-secret',
      },
      write: () => undefined,
    });

    expect(discoverRawMirrorTables).toHaveBeenCalledTimes(1);
    expect(discoverRawMirrorRestTables).not.toHaveBeenCalled();
  });

  it('rejects live mode until raw mirror persistence exists', async () => {
    await expect(
      executeXopureRawMirrorCli(['--live'], {
        env: baseEnv,
        write: () => undefined,
      }),
    ).rejects.toThrow('Raw mirror live mode is not implemented');

    expect(readRawMirrorTableRows).not.toHaveBeenCalled();
  });

  it('fails before connecting when the readonly DSN is missing', async () => {
    await expect(
      executeXopureRawMirrorCli([], {
        env: {},
        write: () => undefined,
      }),
    ).rejects.toThrow('XOPURE_SUPABASE_READONLY_DSN or XOPURE_SUPABASE_READONLY_REST_URL/XOPURE_SUPABASE_READONLY_REST_KEY');

    expect(discoverRawMirrorTables).not.toHaveBeenCalled();
  });

  it('redacts DSN and REST secrets from CLI error messages', () => {
    const message = redactRawMirrorCliError(
      new Error(
        'failed postgres://readonly:secret@db.example.test/xopure https://project.supabase.co rest-secret',
      ),
      {
        ...baseEnv,
        XOPURE_SUPABASE_READONLY_REST_URL: 'https://project.supabase.co',
        XOPURE_SUPABASE_READONLY_REST_KEY: 'rest-secret',
      },
    );

    expect(message).toContain('[redacted]');
    expect(message).not.toContain('secret');
    expect(message).not.toContain('project.supabase.co');
  });
});
