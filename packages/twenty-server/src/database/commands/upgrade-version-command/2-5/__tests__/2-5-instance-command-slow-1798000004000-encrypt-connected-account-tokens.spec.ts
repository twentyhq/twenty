import { type DataSource } from 'typeorm';

import { EncryptConnectedAccountTokensSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000004000-encrypt-connected-account-tokens';
import { ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/utils/envelope.util';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

type FakeRow = {
  id: string;
  workspaceId: string;
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

  const matchesLikePattern = (value: string, pattern: string): boolean => {
    // Translate SQL LIKE to a JS RegExp: `_` is one char, `%` is any string.
    const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');
    const expr = escaped.replace(/%/g, '.*').replace(/_/g, '.');

    return new RegExp(`^${expr}$`).test(value);
  };

  const fakeDataSource = {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      queryCallCount++;

      if (sql.includes('SELECT id')) {
        const cursor = params?.[0] as string;
        const likePattern = params?.[1] as string;

        return rows
          .filter((row) => row.id > cursor)
          .filter(
            (row) =>
              (row.accessToken !== null &&
                !matchesLikePattern(row.accessToken, likePattern)) ||
              (row.refreshToken !== null &&
                !matchesLikePattern(row.refreshToken, likePattern)),
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

describe('EncryptConnectedAccountTokensSlowInstanceCommand', () => {
  // Real AES round-trip is asserted in ConnectedAccountTokenEncryptionService's
  // own spec; here we use a CIPHER(...) wrapper so assertions match exact
  // strings. The fake also encodes the workspaceId so we can prove the slow
  // command threaded it through correctly.
  const buildFakeTokenEncryptionService =
    (): ConnectedAccountTokenEncryptionService =>
      ({
        encrypt: jest.fn(
          (plaintext: string, workspaceId: string): string =>
            `${ENVELOPE_V2_PREFIX}keyid:CIPHER(${plaintext}|${workspaceId})`,
        ),
      }) as unknown as ConnectedAccountTokenEncryptionService;

  const buildCommand = (): {
    command: EncryptConnectedAccountTokensSlowInstanceCommand;
    connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService;
  } => {
    const connectedAccountTokenEncryptionService =
      buildFakeTokenEncryptionService();
    const command = new EncryptConnectedAccountTokensSlowInstanceCommand(
      connectedAccountTokenEncryptionService,
    );

    return { command, connectedAccountTokenEncryptionService };
  };

  describe('runDataMigration', () => {
    it('should encrypt every legacy plaintext row, threading workspaceId into the encryption call, and leave already-prefixed rows untouched', async () => {
      const alreadyEncryptedV1 = `enc:v1:preexisting-v1-ciphertext`;
      const alreadyEncryptedV2 = `${ENVELOPE_V2_PREFIX}deadbeef:preexisting-v2-ciphertext`;
      const wsA = '11111111-1111-1111-1111-111111111111';
      const wsB = '22222222-2222-2222-2222-222222222222';

      const { dataSource, rows } = buildFakeDataSource([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          workspaceId: wsA,
          accessToken: 'plaintext-access-1',
          refreshToken: 'plaintext-refresh-1',
        },
        {
          id: 'bbbbbbbb-0000-0000-0000-000000000002',
          workspaceId: wsB,
          accessToken: alreadyEncryptedV1,
          refreshToken: alreadyEncryptedV2,
        },
        {
          id: 'cccccccc-0000-0000-0000-000000000003',
          workspaceId: wsB,
          accessToken: 'plaintext-access-3',
          refreshToken: null,
        },
      ]);

      const { command } = buildCommand();

      await command.runDataMigration(dataSource);

      expect(rows()).toEqual([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          workspaceId: wsA,
          accessToken: `${ENVELOPE_V2_PREFIX}keyid:CIPHER(plaintext-access-1|${wsA})`,
          refreshToken: `${ENVELOPE_V2_PREFIX}keyid:CIPHER(plaintext-refresh-1|${wsA})`,
        },
        {
          id: 'bbbbbbbb-0000-0000-0000-000000000002',
          workspaceId: wsB,
          accessToken: alreadyEncryptedV1,
          refreshToken: alreadyEncryptedV2,
        },
        {
          id: 'cccccccc-0000-0000-0000-000000000003',
          workspaceId: wsB,
          accessToken: `${ENVELOPE_V2_PREFIX}keyid:CIPHER(plaintext-access-3|${wsB})`,
          refreshToken: null,
        },
      ]);
    });

    // Regression guard: the SELECT filter is per-row (one column unencrypted is
    // enough to fetch the row), so the loop body sees rows where one column is
    // already prefixed and the other isn't. The per-cell prefix check inside
    // the loop is what prevents the prefixed column from being double-encrypted
    // into `enc:v2:keyid:CIPHER(enc:v1:...)`. If that check ever regresses,
    // this is the test that should fail.
    it('should only encrypt the plaintext column when a row mixes encrypted and plaintext tokens', async () => {
      const alreadyEncryptedAccess = `enc:v1:preexisting-access-cipher`;
      const ws = '33333333-3333-3333-3333-333333333333';

      const { dataSource, rows } = buildFakeDataSource([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          workspaceId: ws,
          accessToken: alreadyEncryptedAccess,
          refreshToken: 'plaintext-refresh-mixed',
        },
      ]);

      const { command } = buildCommand();

      await command.runDataMigration(dataSource);

      expect(rows()).toEqual([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          workspaceId: ws,
          accessToken: alreadyEncryptedAccess,
          refreshToken: `${ENVELOPE_V2_PREFIX}keyid:CIPHER(plaintext-refresh-mixed|${ws})`,
        },
      ]);
    });

    it('should be idempotent — re-running on already-migrated data leaves it unchanged', async () => {
      const ws = '44444444-4444-4444-4444-444444444444';

      const { dataSource, rows } = buildFakeDataSource([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          workspaceId: ws,
          accessToken: 'plaintext-token',
          refreshToken: null,
        },
      ]);

      const { command } = buildCommand();

      const expectedFinalState = [
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          workspaceId: ws,
          accessToken: `${ENVELOPE_V2_PREFIX}keyid:CIPHER(plaintext-token|${ws})`,
          refreshToken: null,
        },
      ];

      await command.runDataMigration(dataSource);
      expect(rows()).toEqual(expectedFinalState);

      await command.runDataMigration(dataSource);
      expect(rows()).toEqual(expectedFinalState);
    });

    it('should paginate through more rows than the batch size', async () => {
      const ws = '55555555-5555-5555-5555-555555555555';

      // 1100 rows + batch size 500 → at least 3 SELECT batches.
      const initialRows: FakeRow[] = Array.from({ length: 1100 }, (_, idx) => ({
        // Lex-sortable hex IDs so the cursor advance works the way the SQL does.
        id: `${idx.toString(16).padStart(12, '0')}-0000-0000-0000-000000000000`,
        workspaceId: ws,
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
        rows().every((row) => row.accessToken!.startsWith(ENVELOPE_V2_PREFIX)),
      ).toBe(true);

      // Sanity check: at least the expected number of SELECT batches happened
      // (3 SELECTs for 500/500/100 + 1 final empty SELECT + 1100 UPDATEs)
      expect(queryCallCount()).toBeGreaterThanOrEqual(1100 + 4);
    });
  });
});
