import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { EncryptConnectedAccountTokensSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000004000-encrypt-connected-account-tokens';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

type FakeRow = {
  id: string;
  workspaceId: string;
  accessToken: string | null;
  refreshToken: string | null;
};

const FAKE_V2_KEY_ID = 'deadbeef';

const wrapAsV2 = (plaintext: string, workspaceId: string): string =>
  `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${FAKE_V2_KEY_ID}:CIPHER(${plaintext}|${workspaceId})`;

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
              (isDefined(row.accessToken) &&
                !matchesLikePattern(row.accessToken, likePattern)) ||
              (isDefined(row.refreshToken) &&
                !matchesLikePattern(row.refreshToken, likePattern)),
          )
          .slice(0, batchSize);
      }

      if (sql.startsWith('UPDATE')) {
        const id = params?.[0] as string;
        const target = rows.find((row) => row.id === id);

        if (!isDefined(target)) {
          return;
        }

        const accessTokenMatch = sql.match(/"accessToken" = \$(\d+)/);
        const refreshTokenMatch = sql.match(/"refreshToken" = \$(\d+)/);

        if (isDefined(accessTokenMatch)) {
          target.accessToken = params?.[
            Number(accessTokenMatch[1]) - 1
          ] as string;
        }
        if (isDefined(refreshTokenMatch)) {
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

const buildFakeTokenEncryptionService =
  (): ConnectedAccountTokenEncryptionService =>
    ({
      encrypt: jest.fn(
        ({
          plaintext,
          workspaceId,
        }: {
          plaintext: string;
          workspaceId: string;
        }): string => wrapAsV2(plaintext, workspaceId),
      ),
    }) as unknown as ConnectedAccountTokenEncryptionService;

const buildCommand = (): {
  command: EncryptConnectedAccountTokensSlowInstanceCommand;
} => {
  const command = new EncryptConnectedAccountTokensSlowInstanceCommand(
    buildFakeTokenEncryptionService(),
  );

  return { command };
};

describe('EncryptConnectedAccountTokensSlowInstanceCommand', () => {
  describe('runDataMigration', () => {
    it('upgrades plaintext rows to v2 with workspaceId threaded through, and leaves v2 rows untouched', async () => {
      const wsA = '11111111-1111-1111-1111-111111111111';
      const wsB = '22222222-2222-2222-2222-222222222222';
      const alreadyV2 = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}cafebabe:preexisting-v2-ciphertext`;

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
          accessToken: alreadyV2,
          refreshToken: alreadyV2,
        },
        {
          id: 'cccccccc-0000-0000-0000-000000000003',
          workspaceId: wsB,
          accessToken: 'plaintext-access-3',
          refreshToken: null,
        },
      ]);

      await buildCommand().command.runDataMigration(dataSource);

      expect(rows()).toEqual([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          workspaceId: wsA,
          accessToken: wrapAsV2('plaintext-access-1', wsA),
          refreshToken: wrapAsV2('plaintext-refresh-1', wsA),
        },
        {
          id: 'bbbbbbbb-0000-0000-0000-000000000002',
          workspaceId: wsB,
          accessToken: alreadyV2,
          refreshToken: alreadyV2,
        },
        {
          id: 'cccccccc-0000-0000-0000-000000000003',
          workspaceId: wsB,
          accessToken: wrapAsV2('plaintext-access-3', wsB),
          refreshToken: null,
        },
      ]);
    });

    // Regression guard: the SELECT filter is per-row (one non-v2 column is
    // enough to fetch the row), so the loop sees rows where one column is
    // already v2 and the other is plaintext. The per-cell guard inside the
    // loop is what prevents the v2 column from being double-encrypted.
    it('only rewrites the non-v2 column when a row mixes v2 and plaintext', async () => {
      const ws = '33333333-3333-3333-3333-333333333333';
      const alreadyV2 = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}cafebabe:preexisting-v2-access`;

      const { dataSource, rows } = buildFakeDataSource([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          workspaceId: ws,
          accessToken: alreadyV2,
          refreshToken: 'plaintext-refresh-mixed',
        },
      ]);

      await buildCommand().command.runDataMigration(dataSource);

      expect(rows()).toEqual([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          workspaceId: ws,
          accessToken: alreadyV2,
          refreshToken: wrapAsV2('plaintext-refresh-mixed', ws),
        },
      ]);
    });

    it('is idempotent — a second run leaves already-migrated data unchanged', async () => {
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
          accessToken: wrapAsV2('plaintext-token', ws),
          refreshToken: null,
        },
      ];

      await command.runDataMigration(dataSource);
      expect(rows()).toEqual(expectedFinalState);

      await command.runDataMigration(dataSource);
      expect(rows()).toEqual(expectedFinalState);
    });

    it('paginates through more rows than the batch size', async () => {
      const ws = '55555555-5555-5555-5555-555555555555';
      const initialRows: FakeRow[] = Array.from({ length: 1100 }, (_, idx) => ({
        id: `${idx.toString(16).padStart(12, '0')}-0000-0000-0000-000000000000`,
        workspaceId: ws,
        accessToken: `plaintext-${idx}`,
        refreshToken: null,
      }));

      const { dataSource, rows, queryCallCount } = buildFakeDataSource(
        initialRows,
        { batchSize: 500 },
      );

      await buildCommand().command.runDataMigration(dataSource);

      expect(
        rows().every((row) =>
          row.accessToken!.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX),
        ),
      ).toBe(true);

      // 3 SELECT batches (500/500/100) + 1 final empty SELECT + 1100 UPDATEs.
      expect(queryCallCount()).toBeGreaterThanOrEqual(1100 + 4);
    });
  });
});
