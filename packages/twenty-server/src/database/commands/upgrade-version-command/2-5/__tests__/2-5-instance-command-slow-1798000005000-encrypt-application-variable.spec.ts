import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { EncryptApplicationVariableSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000005000-encrypt-application-variable';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

type FakeRow = {
  id: string;
  workspaceId: string;
  isSecret: boolean;
  value: string;
};

const FAKE_V2_KEY_ID = 'deadbeef';

const wrapAsV2 = (plaintext: string, workspaceId: string): string =>
  `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${FAKE_V2_KEY_ID}:CIPHER(${plaintext}|${workspaceId})`;

const unwrapPlaintext = (ciphertext: string): string => {
  // Legacy CTR ciphertext in this fake is just the raw plaintext.
  if (!ciphertext.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)) {
    return ciphertext;
  }
  const match = ciphertext.match(/CIPHER\((.+)\|.+\)$/);

  return match?.[1] ?? '';
};

const buildFakeDataSource = (initialRows: FakeRow[]) => {
  const rows = [...initialRows].sort((a, b) => a.id.localeCompare(b.id));

  const matchesLikePattern = (value: string, pattern: string): boolean => {
    const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');
    const expr = escaped.replace(/%/g, '.*').replace(/_/g, '.');

    return new RegExp(`^${expr}$`).test(value);
  };

  const dataSource = {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      if (sql.includes('SELECT id')) {
        const cursor = params?.[0] as string;
        const likePattern = params?.[1] as string;

        return rows
          .filter(
            (row) =>
              row.id > cursor &&
              row.isSecret &&
              row.value !== '' &&
              !matchesLikePattern(row.value, likePattern),
          )
          .slice(0, params?.[2] as number);
      }

      if (sql.startsWith('UPDATE')) {
        const id = params?.[0] as string;
        const target = rows.find((row) => row.id === id);

        if (isDefined(target)) {
          target.value = params?.[1] as string;
        }

        return;
      }

      return;
    }),
  } as unknown as DataSource;

  return { dataSource, rows: () => rows };
};

const buildFakeSecretEncryptionService = (): SecretEncryptionService =>
  ({
    decryptVersioned: jest.fn((value: string) => unwrapPlaintext(value)),
    encryptVersioned: jest.fn(
      (plaintext: string, opts?: { workspaceId?: string }) =>
        wrapAsV2(plaintext, opts?.workspaceId ?? 'instance'),
    ),
  }) as unknown as SecretEncryptionService;

describe('EncryptApplicationVariableSlowInstanceCommand', () => {
  describe('runDataMigration', () => {
    it('re-encrypts secret rows into the v2 envelope bound to their workspaceId', async () => {
      const wsA = '11111111-1111-1111-1111-111111111111';
      const wsB = '22222222-2222-2222-2222-222222222222';

      const { dataSource, rows } = buildFakeDataSource([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          workspaceId: wsA,
          isSecret: true,
          value: 'plaintext-secret-a',
        },
        {
          id: 'bbbbbbbb-0000-0000-0000-000000000002',
          workspaceId: wsB,
          isSecret: true,
          value: wrapAsV2('already-v2', wsB),
        },
        {
          id: 'cccccccc-0000-0000-0000-000000000003',
          workspaceId: wsB,
          isSecret: false,
          value: 'plaintext-non-secret',
        },
      ]);

      await new EncryptApplicationVariableSlowInstanceCommand(
        buildFakeSecretEncryptionService(),
      ).runDataMigration(dataSource);

      expect(rows()).toEqual([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          workspaceId: wsA,
          isSecret: true,
          value: wrapAsV2('plaintext-secret-a', wsA),
        },
        {
          id: 'bbbbbbbb-0000-0000-0000-000000000002',
          workspaceId: wsB,
          isSecret: true,
          value: wrapAsV2('already-v2', wsB),
        },
        {
          id: 'cccccccc-0000-0000-0000-000000000003',
          workspaceId: wsB,
          isSecret: false,
          value: 'plaintext-non-secret',
        },
      ]);
    });

    it('is idempotent — a second run leaves migrated data unchanged', async () => {
      const ws = '33333333-3333-3333-3333-333333333333';

      const { dataSource, rows } = buildFakeDataSource([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          workspaceId: ws,
          isSecret: true,
          value: 'legacy-plaintext',
        },
      ]);

      const command = new EncryptApplicationVariableSlowInstanceCommand(
        buildFakeSecretEncryptionService(),
      );

      await command.runDataMigration(dataSource);
      const afterFirstRun = JSON.parse(JSON.stringify(rows()));

      await command.runDataMigration(dataSource);
      expect(rows()).toEqual(afterFirstRun);
    });
  });
});
