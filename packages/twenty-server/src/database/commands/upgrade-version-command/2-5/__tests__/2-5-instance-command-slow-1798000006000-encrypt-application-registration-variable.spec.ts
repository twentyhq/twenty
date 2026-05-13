import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { EncryptApplicationRegistrationVariableSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000006000-encrypt-application-registration-variable';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

type FakeRow = {
  id: string;
  encryptedValue: string;
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
              row.encryptedValue !== '' &&
              !matchesLikePattern(row.encryptedValue, likePattern),
          )
          .slice(0, params?.[2] as number);
      }

      if (sql.startsWith('UPDATE')) {
        const id = params?.[0] as string;
        const target = rows.find((row) => row.id === id);

        if (isDefined(target)) {
          target.encryptedValue = params?.[1] as string;
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

describe('EncryptApplicationRegistrationVariableSlowInstanceCommand', () => {
  describe('runDataMigration', () => {
    it('re-encrypts filled rows with instance-scope HKDF and leaves empty rows untouched', async () => {
      const { dataSource, rows } = buildFakeDataSource([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          encryptedValue: 'plaintext-legacy',
        },
        {
          id: 'bbbbbbbb-0000-0000-0000-000000000002',
          encryptedValue: '',
        },
        {
          id: 'cccccccc-0000-0000-0000-000000000003',
          encryptedValue: wrapAsInstanceV2('already-v2'),
        },
      ]);

      const encryption = buildFakeSecretEncryptionService();

      await new EncryptApplicationRegistrationVariableSlowInstanceCommand(
        encryption,
      ).runDataMigration(dataSource);

      expect(rows()).toEqual([
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          encryptedValue: wrapAsInstanceV2('plaintext-legacy'),
        },
        {
          id: 'bbbbbbbb-0000-0000-0000-000000000002',
          encryptedValue: '',
        },
        {
          id: 'cccccccc-0000-0000-0000-000000000003',
          encryptedValue: wrapAsInstanceV2('already-v2'),
        },
      ]);
      // Registration variables are instance-scoped: no workspaceId in HKDF.
      expect(encryption.encryptVersioned).toHaveBeenCalledWith(
        'plaintext-legacy',
      );
    });
  });
});
