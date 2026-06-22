import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  discoverRawMirrorTables,
  readRawMirrorTableRows,
} from '../raw-mirror/run-xopure-raw-mirror';
import { executeXopureRawMirrorCli } from './run-xopure-raw-mirror';

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
  });

  it('defaults to dry-run and prints only summary fields', async () => {
    const output: string[] = [];

    await executeXopureRawMirrorCli([], {
      env: baseEnv,
      write: (chunk) => output.push(chunk),
    });

    expect(discoverRawMirrorTables).toHaveBeenCalledWith(expect.any(Object), 'public');
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
    ).rejects.toThrow('XOPURE_SUPABASE_READONLY_DSN');

    expect(discoverRawMirrorTables).not.toHaveBeenCalled();
  });
});
