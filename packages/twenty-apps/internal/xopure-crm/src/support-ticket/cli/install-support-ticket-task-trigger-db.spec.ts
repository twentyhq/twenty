import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildSupportTicketTaskTriggerSql,
  executeSupportTicketTaskTriggerDbCli,
  type InstallTriggerDbCliResult,
} from './install-support-ticket-task-trigger-db';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const baseEnv = {
  TWENTY_DB_DSN: 'postgres://twenty:secret@db.example.test/twenty_v2',
  TWENTY_WORKSPACE_SCHEMA: 'workspace_abc123',
};

const mockCountResult = {
  rows: [{ count: '5' }],
};

// ===========================================================================
// Block A — SQL contract (pure function, no mocks needed)
// ===========================================================================

describe('buildSupportTicketTaskTriggerSql', () => {
  const SCHEMA = 'workspace_abc123';

  it('targets schema-qualified "_xopureSupportTicket"', () => {
    const sql = buildSupportTicketTaskTriggerSql(SCHEMA);

    expect(sql).toMatch(new RegExp(`"${SCHEMA}"\\."_xopureSupportTicket"`));
  });

  it('creates xopure_support_ticket_task_creator function', () => {
    const sql = buildSupportTicketTaskTriggerSql(SCHEMA);

    expect(sql).toMatch(
      /CREATE\s+OR\s+REPLACE\s+FUNCTION.*xopure_support_ticket_task_creator/,
    );
  });

  it('creates xopure_support_ticket_task_creator_after_insert trigger', () => {
    const sql = buildSupportTicketTaskTriggerSql(SCHEMA);

    expect(sql).toMatch(
      /CREATE\s+TRIGGER\s+xopure_support_ticket_task_creator_after_insert/,
    );
  });

  it('uses targetXopureSupportTicketId for linking', () => {
    const sql = buildSupportTicketTaskTriggerSql(SCHEMA);

    expect(sql).toMatch(/targetXopureSupportTicketId/);
  });

  it('includes idempotency guard skipping existing taskTarget', () => {
    const sql = buildSupportTicketTaskTriggerSql(SCHEMA);

    // Trigger function: IF EXISTS guard returns early when non-deleted
    // taskTarget already linked via targetXopureSupportTicketId
    expect(sql).toMatch(
      /IF\s+EXISTS.*targetXopureSupportTicketId.*deletedAt"?\s+IS\s+NULL/is,
    );

    // Backfill CTE: NOT EXISTS guard prevents duplicate taskTarget creation
    // for tickets that already have a non-deleted taskTarget
    expect(sql).toMatch(
      /NOT\s+EXISTS.*targetXopureSupportTicketId.*deletedAt"?\s+IS\s+NULL/is,
    );
  });


  it('includes task fields: title, body, dueAt, TODO status', () => {
    const sql = buildSupportTicketTaskTriggerSql(SCHEMA);

    expect(sql).toMatch(/title/);
    expect(sql).toMatch(/"bodyV2Markdown"/);
    expect(sql).toMatch(/"dueAt"/);
    expect(sql).toMatch(/status/);
    expect(sql).toContain("'TODO'");
  });

  it('splits createdBy*/updatedBy* actor fields', () => {
    const sql = buildSupportTicketTaskTriggerSql(SCHEMA);

    expect(sql).toMatch(/"createdBySource"/);
    expect(sql).toMatch(/"createdByWorkspaceMemberId"/);
    expect(sql).toMatch(/"createdByName"/);
    expect(sql).toMatch(/"createdByContext"/);
    expect(sql).toMatch(/"updatedBySource"/);
    expect(sql).toMatch(/"updatedByWorkspaceMemberId"/);
    expect(sql).toMatch(/"updatedByName"/);
    expect(sql).toMatch(/"updatedByContext"/);
  });

  it('includes backfill CTE chain', () => {
    const sql = buildSupportTicketTaskTriggerSql(SCHEMA);

    expect(sql).toMatch(/WITH\s+backfill_tickets\s+AS\s*\(/i);
  });

  it('reports backfill count', () => {
    const sql = buildSupportTicketTaskTriggerSql(SCHEMA);

    expect(sql).toMatch(/SELECT\s+COUNT\(\*\)/i);
  });

  it('produces a single executable SQL block', () => {
    const sql = buildSupportTicketTaskTriggerSql(SCHEMA);

    // Single statement: function → trigger DDL → backfill CTE all in one query
    expect(sql).toContain('CREATE OR REPLACE FUNCTION');
    expect(sql).toContain('CREATE TRIGGER');
    expect(sql).toContain('WITH backfill_tickets');
    expect(sql).toContain('SELECT COUNT(*)');
  });

  it('qualifies identifiers with the workspace schema', () => {
    const sql = buildSupportTicketTaskTriggerSql(SCHEMA);

    // Identifier pattern: "workspace_abc123"."tableName"
    expect(sql).toMatch(new RegExp(`"${SCHEMA}"\\."_xopureSupportTicket"`));
    expect(sql).toMatch(new RegExp(`"${SCHEMA}"\\."task"`));
    expect(sql).toMatch(new RegExp(`"${SCHEMA}"\\."taskTarget"`));
  });
});

// ===========================================================================
// Block B — CLI orchestrator (env, pool lifecycle, transaction, output)
// ===========================================================================

describe('executeSupportTicketTaskTriggerDbCli', () => {
  let mockClient: {
    query: ReturnType<typeof vi.fn>;
    release: ReturnType<typeof vi.fn>;
  };
  let mockPool: {
    connect: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
  };
  let createPool: ReturnType<typeof vi.fn>;
  let outputChunks: string[];

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      query: vi.fn().mockResolvedValue(mockCountResult),
      release: vi.fn(),
    };
    mockPool = {
      connect: vi.fn().mockResolvedValue(mockClient),
      end: vi.fn().mockResolvedValue(undefined),
    };
    createPool = vi.fn().mockReturnValue(mockPool);
    outputChunks = [];
  });

  // -----------------------------------------------------------------------
  // Env requirements
  // -----------------------------------------------------------------------

  it('throws when TWENTY_DB_DSN is missing', async () => {
    await expect(
      executeSupportTicketTaskTriggerDbCli([], {
        env: { TWENTY_WORKSPACE_SCHEMA: 'workspace_xyz' },
        createPool,
        write: (chunk) => outputChunks.push(chunk),
      }),
    ).rejects.toThrow('TWENTY_DB_DSN');

    expect(createPool).not.toHaveBeenCalled();
    expect(mockPool.connect).not.toHaveBeenCalled();
  });

  it('throws when TWENTY_WORKSPACE_SCHEMA is missing', async () => {
    await expect(
      executeSupportTicketTaskTriggerDbCli([], {
        env: { TWENTY_DB_DSN: 'postgres://u:p@host/db' },
        createPool,
        write: (chunk) => outputChunks.push(chunk),
      }),
    ).rejects.toThrow('TWENTY_WORKSPACE_SCHEMA');

    expect(createPool).not.toHaveBeenCalled();
  });

  it('validates workspace schema against /^workspace_[a-z0-9]+$/', async () => {
    await expect(
      executeSupportTicketTaskTriggerDbCli([], {
        env: {
          TWENTY_DB_DSN: 'postgres://u:p@host/db',
          TWENTY_WORKSPACE_SCHEMA: 'INVALID!',
        },
        createPool,
        write: (chunk) => outputChunks.push(chunk),
      }),
    ).rejects.toThrow(/workspace.*schema/i);

    expect(createPool).not.toHaveBeenCalled();
  });

  it('rejects empty workspace schema', async () => {
    await expect(
      executeSupportTicketTaskTriggerDbCli([], {
        env: {
          TWENTY_DB_DSN: 'postgres://u:p@host/db',
          TWENTY_WORKSPACE_SCHEMA: '',
        },
        createPool,
        write: (chunk) => outputChunks.push(chunk),
      }),
    ).rejects.toThrow('TWENTY_WORKSPACE_SCHEMA');
  });

  // -----------------------------------------------------------------------
  // Pool lifecycle
  // -----------------------------------------------------------------------

  it('creates pool with DSN via createPool factory', async () => {
    await executeSupportTicketTaskTriggerDbCli([], {
      env: baseEnv,
      createPool,
      write: (chunk) => outputChunks.push(chunk),
    });

    expect(createPool).toHaveBeenCalledWith(baseEnv.TWENTY_DB_DSN);
  });

  it('connects, runs SQL, commits, releases, ends pool', async () => {
    await executeSupportTicketTaskTriggerDbCli([], {
      env: baseEnv,
      createPool,
      write: (chunk) => outputChunks.push(chunk),
    });

    expect(mockPool.connect).toHaveBeenCalledTimes(1);

    // The SQL passed to client.query should contain the function DDL
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE OR REPLACE FUNCTION'),
    );

    // Transaction lifecycle
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');

    // Cleanup
    expect(mockClient.release).toHaveBeenCalledTimes(1);
    expect(mockPool.end).toHaveBeenCalledTimes(1);
  });

  it('issues ROLLBACK and rethrows on error', async () => {
    const dbError = new Error('deadlock detected');
    mockClient.query.mockRejectedValue(dbError);
    // Clear the mock for BEGIN so the error comes from the SQL call
    mockClient.query.mockResolvedValueOnce(undefined); // BEGIN
    mockClient.query.mockRejectedValueOnce(dbError);   // SQL

    await expect(
      executeSupportTicketTaskTriggerDbCli([], {
        env: baseEnv,
        createPool,
        write: (chunk) => outputChunks.push(chunk),
      }),
    ).rejects.toThrow('deadlock detected');

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.query).not.toHaveBeenCalledWith('COMMIT');
    expect(mockClient.release).toHaveBeenCalledTimes(1);
    expect(mockPool.end).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------------------------------------
  // JSON summary output
  // -----------------------------------------------------------------------

  it('outputs valid JSON with functionName, triggerName, backfillInserted', async () => {
    await executeSupportTicketTaskTriggerDbCli([], {
      env: baseEnv,
      createPool,
      write: (chunk) => outputChunks.push(chunk),
    });

    const parsed: InstallTriggerDbCliResult = JSON.parse(outputChunks.join(''));

    expect(parsed).toMatchObject({
      functionName: expect.stringContaining('task_creator'),
      triggerName: expect.stringContaining('task_creator_after_insert'),
      functionCreated: true,
      triggerCreated: true,
      backfillInserted: 5,
    });
  });

  it('reads backfill count from pg multi-statement result arrays', async () => {
    mockClient.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([
        { rows: [] },
        { rows: [] },
        { rows: [{ count: '7' }] },
      ])
      .mockResolvedValueOnce(undefined);

    await executeSupportTicketTaskTriggerDbCli([], {
      env: baseEnv,
      createPool,
      write: (chunk) => outputChunks.push(chunk),
    });

    expect(JSON.parse(outputChunks.join(''))).toMatchObject({
      backfillInserted: 7,
    });
  });

  it('does not leak DSN secret in output', async () => {
    await executeSupportTicketTaskTriggerDbCli([], {
      env: baseEnv,
      createPool,
      write: (chunk) => outputChunks.push(chunk),
    });

    const text = outputChunks.join('');
    expect(text).not.toContain('secret');
  });

  it('cleanup runs even when error happens after connect but before query', async () => {
    // Simulate ROLLBACK also failing — implementation's catch block runs
    // `await client.query('ROLLBACK')` which, on failure, replaces the
    // original error with 'rollback failed'
    mockClient.query.mockResolvedValueOnce(undefined);      // BEGIN
    mockClient.query.mockRejectedValueOnce(new Error('SQL')); // SQL
    // ROLLBACK will also fail — should not prevent cleanup
    mockClient.query.mockRejectedValueOnce(new Error('rollback failed'));

    await expect(
      executeSupportTicketTaskTriggerDbCli([], {
        env: baseEnv,
        createPool,
        write: (chunk) => outputChunks.push(chunk),
      }),
    ).rejects.toThrow('rollback failed');

    // Cleanup still runs
    expect(mockClient.release).toHaveBeenCalledTimes(1);
    expect(mockPool.end).toHaveBeenCalledTimes(1);
  });
});
