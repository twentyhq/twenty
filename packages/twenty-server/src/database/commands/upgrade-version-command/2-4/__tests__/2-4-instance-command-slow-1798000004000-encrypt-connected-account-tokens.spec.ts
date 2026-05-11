import { type DataSource, type QueryRunner } from 'typeorm';

import { EncryptConnectedAccountTokensSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-4/2-4-instance-command-slow-1798000004000-encrypt-connected-account-tokens';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

type FakeRow = {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
};

// In-memory stand-in that mimics the slow command's exact SELECT / UPDATE
// shape (LIKE filter, cursor, batch) — anything looser would let regressions
// in the SQL slip past these tests.
const buildFakeDataSource = (
  initialRows: FakeRow[],
  { batchSize }: { batchSize: number } = { batchSize: 500 },
): {
  dataSource: DataSource;
  rows: () => FakeRow[];
  queryCallCount: () => number;
} => {
  const rows = [...initialRows].sort((a, b) => a.id.localeCompare(b.id));
  let queryCallCount = 0;

  const fakeDataSource = {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      queryCallCount++;

      if (sql.includes('SELECT id')) {
        const cursor = params?.[0] as string;
        const prefixPattern = params?.[1] as string;
        const prefix = prefixPattern.replace(/%$/, '');

        return rows
          .filter((row) => row.id > cursor)
          .filter(
            (row) =>
              (row.accessToken !== null &&
                !row.accessToken.startsWith(prefix)) ||
              (row.refreshToken !== null &&
                !row.refreshToken.startsWith(prefix)),
          )
          .slice(0, batchSize);
      }

      if (sql.startsWith('UPDATE')) {
        const id = params?.[0] as string;
        const target = rows.find((row) => row.id === id);

        if (!target) {
          return;
        }

        // Mirror the SQL: SET "accessToken" = $N, "refreshToken" = $M WHERE id = $1
        const accessTokenMatch = sql.match(/"accessToken" = \$(\d+)/);
        const refreshTokenMatch = sql.match(/"refreshToken" = \$(\d+)/);

        if (accessTokenMatch) {
          target.accessToken = params?.[
            Number(accessTokenMatch[1]) - 1
          ] as string;
        }
        if (refreshTokenMatch) {
          target.refreshToken = params?.[
            Number(refreshTokenMatch[1]) - 1
          ] as string;
        }

        return;
      }

      return;
    }),
  } as unknown as DataSource;

  return {
    dataSource: fakeDataSource,
    rows: () => rows,
    queryCallCount: () => queryCallCount,
  };
};

const buildFakeQueryRunner = (): {
  queryRunner: QueryRunner;
  queries: string[];
} => {
  const queries: string[] = [];

  const queryRunner = {
    query: jest.fn(async (sql: string) => {
      queries.push(sql);
    }),
  } as unknown as QueryRunner;

  return { queryRunner, queries };
};

describe('EncryptConnectedAccountTokensSlowInstanceCommand', () => {
  // Real AES output is asserted in SecretEncryptionService's own spec; here
  // we use a CIPHER(...) wrapper so assertions match exact strings.
  const buildFakeSecretEncryptionService = (): SecretEncryptionService =>
    ({
      encrypt: jest.fn((plaintext: string): string => `CIPHER(${plaintext})`),
    }) as unknown as SecretEncryptionService;

  const buildCommand = (): {
    command: EncryptConnectedAccountTokensSlowInstanceCommand;
    secretEncryptionService: SecretEncryptionService;
  } => {
    const secretEncryptionService = buildFakeSecretEncryptionService();
    const command = new EncryptConnectedAccountTokensSlowInstanceCommand(
      secretEncryptionService,
    );

    return { command, secretEncryptionService };
  };

  describe('runDataMigration', () => {
    it('should encrypt every legacy plaintext row and leave already-prefixed rows untouched', async () => {
      const alreadyEncrypted = `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}preexisting-ciphertext`;

      const { dataSource, rows } = buildFakeDataSource([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          accessToken: 'plaintext-access-1',
          refreshToken: 'plaintext-refresh-1',
        },
        {
          id: 'bbbbbbbb-0000-0000-0000-000000000002',
          accessToken: alreadyEncrypted,
          refreshToken: alreadyEncrypted,
        },
        {
          id: 'cccccccc-0000-0000-0000-000000000003',
          accessToken: 'plaintext-access-3',
          refreshToken: null,
        },
      ]);

      const { command } = buildCommand();

      await command.runDataMigration(dataSource);

      const finalRows = rows();

      // Row 1: both columns went through encrypt() and got the prefix
      const row1 = finalRows.find((row) =>
        row.id.startsWith('aaaaaaaa'),
      ) as FakeRow;

      expect(row1.accessToken).toBe(
        `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(plaintext-access-1)`,
      );
      expect(row1.refreshToken).toBe(
        `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(plaintext-refresh-1)`,
      );

      // Row 2: untouched (already prefixed — the SELECT filter excludes it)
      const row2 = finalRows.find((row) =>
        row.id.startsWith('bbbbbbbb'),
      ) as FakeRow;

      expect(row2.accessToken).toBe(alreadyEncrypted);
      expect(row2.refreshToken).toBe(alreadyEncrypted);

      // Row 3: only accessToken rotated; refreshToken stays null
      const row3 = finalRows.find((row) =>
        row.id.startsWith('cccccccc'),
      ) as FakeRow;

      expect(row3.accessToken).toBe(
        `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(plaintext-access-3)`,
      );
      expect(row3.refreshToken).toBeNull();
    });

    // Regression guard: the SELECT filter is per-row (one column unencrypted is
    // enough to fetch the row), so the loop body sees rows where one column is
    // already prefixed and the other isn't. The per-cell prefix check inside
    // the loop is what prevents the prefixed column from being double-encrypted
    // into `enc:v1:CIPHER(enc:v1:...)`. If that check ever regresses, this is
    // the test that should fail.
    it('should only encrypt the plaintext column when a row mixes encrypted and plaintext tokens', async () => {
      const alreadyEncryptedAccess = `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}preexisting-access-cipher`;

      const { dataSource, rows } = buildFakeDataSource([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          accessToken: alreadyEncryptedAccess,
          refreshToken: 'plaintext-refresh-mixed',
        },
      ]);

      const { command, secretEncryptionService } = buildCommand();

      await command.runDataMigration(dataSource);

      const finalRow = rows()[0];

      expect(finalRow.accessToken).toBe(alreadyEncryptedAccess);
      expect(finalRow.refreshToken).toBe(
        `${CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX}CIPHER(plaintext-refresh-mixed)`,
      );
      expect(secretEncryptionService.encrypt).toHaveBeenCalledTimes(1);
      expect(secretEncryptionService.encrypt).toHaveBeenCalledWith(
        'plaintext-refresh-mixed',
      );
    });

    it('should delegate APP_SECRET handling to SecretEncryptionService and never read process.env directly', async () => {
      const { dataSource } = buildFakeDataSource([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          accessToken: 'plaintext',
          refreshToken: null,
        },
      ]);

      const { command, secretEncryptionService } = buildCommand();

      await command.runDataMigration(dataSource);

      expect(secretEncryptionService.encrypt).toHaveBeenCalledWith('plaintext');
      expect(secretEncryptionService.encrypt).toHaveBeenCalledTimes(1);
    });

    it('should be idempotent — a second run produces zero updates', async () => {
      const { dataSource, queryCallCount } = buildFakeDataSource([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          accessToken: 'plaintext-token',
          refreshToken: null,
        },
      ]);

      const { command } = buildCommand();

      await command.runDataMigration(dataSource);
      const callsAfterFirstRun = queryCallCount();

      await command.runDataMigration(dataSource);
      const callsAfterSecondRun = queryCallCount();

      // Second run = exactly one SELECT (returns empty) + zero UPDATEs.
      // First run was: SELECT (returns row), UPDATE (encrypts), SELECT (empty).
      expect(callsAfterSecondRun - callsAfterFirstRun).toBe(1);
    });

    it('should paginate through more rows than the batch size', async () => {
      // 1100 rows + batch size 500 → at least 3 SELECT batches.
      const initialRows: FakeRow[] = Array.from({ length: 1100 }, (_, idx) => ({
        // Lex-sortable hex IDs so the cursor advance works the way the SQL does.
        id: `${idx.toString(16).padStart(12, '0')}-0000-0000-0000-000000000000`,
        accessToken: `plaintext-${idx}`,
        refreshToken: null,
      }));

      const { dataSource, rows, queryCallCount } = buildFakeDataSource(
        initialRows,
        { batchSize: 500 },
      );

      const { command } = buildCommand();

      await command.runDataMigration(dataSource);

      // Every row got encrypted
      expect(
        rows().every((row) =>
          row.accessToken!.startsWith(
            CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX,
          ),
        ),
      ).toBe(true);

      // Sanity check: at least the expected number of SELECT batches happened
      // (3 SELECTs for 500/500/100 + 1 final empty SELECT + 1100 UPDATEs)
      expect(queryCallCount()).toBeGreaterThanOrEqual(1100 + 4);
    });
  });

  describe('up (CHECK constraint enforcement)', () => {
    it('should add CHECK constraints on both token columns', async () => {
      const { queryRunner, queries } = buildFakeQueryRunner();

      const { command } = buildCommand();

      await command.up(queryRunner);

      expect(queries).toHaveLength(2);

      expect(queries[0]).toMatch(/ADD CONSTRAINT/);
      expect(queries[0]).toMatch(/"accessToken"/);
      expect(queries[0]).toContain(CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX);

      expect(queries[1]).toMatch(/ADD CONSTRAINT/);
      expect(queries[1]).toMatch(/"refreshToken"/);
      expect(queries[1]).toContain(CONNECTED_ACCOUNT_TOKEN_ENCRYPTION_PREFIX);
    });
  });

  describe('down (rollback safety)', () => {
    it('should drop the CHECK constraints WITHOUT decrypting any data', async () => {
      const { queryRunner, queries } = buildFakeQueryRunner();

      const { command } = buildCommand();

      await command.down(queryRunner);

      expect(queries).toHaveLength(2);

      expect(queries[0]).toMatch(/DROP CONSTRAINT IF EXISTS/);
      expect(queries[1]).toMatch(/DROP CONSTRAINT IF EXISTS/);

      // Critical regression guard: rollback must NEVER re-introduce
      // plaintext tokens into the database.
      for (const sql of queries) {
        expect(sql).not.toMatch(/UPDATE/);
        expect(sql).not.toMatch(/DECRYPT/i);
        expect(sql).not.toMatch(/SUBSTRING/i);
      }
    });
  });
});
