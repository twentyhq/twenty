import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSupabaseReaderFromAnyEnv } from '../backfill/read-supabase-rest-source';
import { runXopureBackfill } from '../backfill/run-xopure-backfill';
import { createTwentyRestClient } from '../twenty-rest-client';
import { executeXopureBackfillCli } from './run-xopure-backfill';

vi.mock('../backfill/read-supabase-rest-source', () => ({
  createSupabaseReaderFromAnyEnv: vi.fn(),
}));

vi.mock('../backfill/run-xopure-backfill', () => ({
  runXopureBackfill: vi.fn(),
}));

vi.mock('../twenty-rest-client', () => ({
  createTwentyRestClient: vi.fn(),
}));

const baseEnv = {
  XOPURE_TWENTY_API_URL: 'https://twenty.example.test',
  XOPURE_TWENTY_API_KEY: 'twenty-secret-key',
  XOPURE_SUPABASE_READONLY_REST_URL: 'https://supabase.example.test',
  XOPURE_SUPABASE_READONLY_REST_KEY: 'supabase-secret-key',
};

const reader = vi.fn();
const client = {
  query: vi.fn(),
  mutation: vi.fn(),
};

const runResult = {
  dryRun: true,
  scanned: 2,
  mapped: 2,
  created: 0,
  updated: 0,
  skipped: 0,
  failed: 0,
  durationMs: 12,
  tableCount: 1,
  records: [
    {
      sourceSystem: 'supabase' as const,
      sourceSchema: 'public',
      sourceTable: 'products' as const,
      sourceRecordId: 'should-not-print',
      syncKey: 'supabase:public:products:should-not-print',
      targetObject: 'xopureProduct' as const,
      externalIdField: 'supabaseProductId',
      externalIdValue: 'should-not-print',
      fieldValues: {},
      relations: [],
      contentHash: 'hash',
    },
  ],
  errors: [],
};

describe('executeXopureBackfillCli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createSupabaseReaderFromAnyEnv).mockReturnValue(reader);
    vi.mocked(createTwentyRestClient).mockReturnValue(client);
    vi.mocked(runXopureBackfill).mockResolvedValue(runResult);
  });

  it('defaults to dry-run and prints only summary fields', async () => {
    const output: string[] = [];

    await executeXopureBackfillCli([], {
      env: baseEnv,
      write: (chunk) => output.push(chunk),
    });

    expect(createSupabaseReaderFromAnyEnv).toHaveBeenCalledWith(baseEnv);
    expect(createTwentyRestClient).toHaveBeenCalledWith({
      apiUrl: 'https://twenty.example.test',
      apiKey: 'twenty-secret-key',
    });
    expect(runXopureBackfill).toHaveBeenCalledWith({
      readSourceBatch: reader,
      client,
      dryRun: true,
    });

    const text = output.join('');
    expect(text).not.toContain('should-not-print');
    expect(text).not.toContain('twenty-secret-key');
    expect(text).not.toContain('supabase-secret-key');
    expect(JSON.parse(text)).toEqual({
      dryRun: true,
      scanned: 2,
      mapped: 2,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      durationMs: 12,
      tableCount: 1,
      errors: [],
    });
  });

  it('runs live for a single source table when requested', async () => {
    vi.mocked(runXopureBackfill).mockResolvedValue({
      ...runResult,
      dryRun: false,
      created: 2,
    });

    await executeXopureBackfillCli(['--live', '--source-table=products'], {
      env: baseEnv,
      write: () => undefined,
    });

    expect(runXopureBackfill).toHaveBeenCalledWith({
      readSourceBatch: reader,
      client,
      dryRun: false,
      sourceTables: ['products'],
    });
  });

  it('fails before constructing clients when Twenty credentials are missing', async () => {
    await expect(
      executeXopureBackfillCli([], {
        env: {
          XOPURE_SUPABASE_READONLY_REST_URL: 'https://supabase.example.test',
          XOPURE_SUPABASE_READONLY_REST_KEY: 'supabase-secret-key',
        },
        write: () => undefined,
      }),
    ).rejects.toThrow('Missing Twenty API URL');

    expect(createSupabaseReaderFromAnyEnv).not.toHaveBeenCalled();
    expect(createTwentyRestClient).not.toHaveBeenCalled();
    expect(runXopureBackfill).not.toHaveBeenCalled();
  });

  it('fails before constructing clients when Supabase source credentials are missing', async () => {
    await expect(
      executeXopureBackfillCli([], {
        env: {
          XOPURE_TWENTY_API_URL: 'https://twenty.example.test',
          XOPURE_TWENTY_API_KEY: 'twenty-secret-key',
        },
        write: () => undefined,
      }),
    ).rejects.toThrow('Missing Supabase source env');

    expect(createSupabaseReaderFromAnyEnv).not.toHaveBeenCalled();
    expect(createTwentyRestClient).not.toHaveBeenCalled();
    expect(runXopureBackfill).not.toHaveBeenCalled();
  });

  it('rejects unsupported source tables', async () => {
    await expect(
      executeXopureBackfillCli(['--source-table=not_a_table'], {
        env: baseEnv,
        write: () => undefined,
      }),
    ).rejects.toThrow('Unsupported --source-table');

    expect(runXopureBackfill).not.toHaveBeenCalled();
  });
});
