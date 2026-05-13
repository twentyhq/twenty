import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { EncryptSigningKeyPrivateKeysSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000007000-encrypt-signing-key-private-keys';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

type FakeRow = {
  id: string;
  privateKey: string | null;
};

const FAKE_V2_KEY_ID = 'deadbeef';

const wrapAsInstanceV2 = (plaintext: string): string =>
  `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${FAKE_V2_KEY_ID}:CIPHER(${plaintext}|instance)`;

const unwrapPlaintext = (ciphertext: string): string => {
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
              isDefined(row.privateKey) &&
              !matchesLikePattern(row.privateKey, likePattern),
          )
          .slice(0, params?.[2] as number);
      }

      if (sql.startsWith('UPDATE')) {
        const id = params?.[0] as string;
        const target = rows.find((row) => row.id === id);

        if (isDefined(target)) {
          target.privateKey = params?.[1] as string;
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
    encryptVersioned: jest.fn((plaintext: string) =>
      wrapAsInstanceV2(plaintext),
    ),
  }) as unknown as SecretEncryptionService;

describe('EncryptSigningKeyPrivateKeysSlowInstanceCommand', () => {
  describe('runDataMigration', () => {
    it('upgrades legacy private keys to v2 envelope and skips NULL/already-v2 rows', async () => {
      const { dataSource, rows } = buildFakeDataSource([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          privateKey: '-----BEGIN PRIVATE KEY-----legacy-pem-----END-----',
        },
        {
          id: 'bbbbbbbb-0000-0000-0000-000000000002',
          privateKey: null,
        },
        {
          id: 'cccccccc-0000-0000-0000-000000000003',
          privateKey: wrapAsInstanceV2('already-v2-pem'),
        },
      ]);

      const encryption = buildFakeSecretEncryptionService();

      await new EncryptSigningKeyPrivateKeysSlowInstanceCommand(
        encryption,
      ).runDataMigration(dataSource);

      expect(rows()).toEqual([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          privateKey: wrapAsInstanceV2(
            '-----BEGIN PRIVATE KEY-----legacy-pem-----END-----',
          ),
        },
        {
          id: 'bbbbbbbb-0000-0000-0000-000000000002',
          privateKey: null,
        },
        {
          id: 'cccccccc-0000-0000-0000-000000000003',
          privateKey: wrapAsInstanceV2('already-v2-pem'),
        },
      ]);
      // Signing keys are instance-scoped: no workspaceId on the encryption call.
      expect(encryption.encryptVersioned).toHaveBeenCalledWith(
        '-----BEGIN PRIVATE KEY-----legacy-pem-----END-----',
      );
    });
  });
});
