import { type DataSource, type Repository } from 'typeorm';

import { EncryptSensitiveConfigStorageSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000008000-encrypt-sensitive-config-storage';
import {
  KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TypedReflect } from 'src/utils/typed-reflect';

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

const buildFakeRepository = (
  initialRows: KeyValuePairEntity[],
): jest.Mocked<Repository<KeyValuePairEntity>> => {
  const rows = [...initialRows];

  return {
    // Crude match: filter by the declared key only. The slow command always
    // queries instance-scoped rows (userId IS NULL, workspaceId IS NULL,
    // type CONFIG_VARIABLE), which matches every row this fake holds.
    find: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
      return rows.filter(
        (row) => row.type === where.type && row.key === where.key,
      );
    }),
    update: jest.fn(
      async (criteria: { id: string }, update: Partial<KeyValuePairEntity>) => {
        const target = rows.find((row) => row.id === criteria.id);

        if (target) {
          target.value = update.value!;
        }
      },
    ),
  } as unknown as jest.Mocked<Repository<KeyValuePairEntity>>;
};

const buildFakeDataSource = (
  repository: Repository<KeyValuePairEntity>,
): DataSource =>
  ({
    getRepository: jest.fn(() => repository),
  }) as unknown as DataSource;

const buildFakeSecretEncryptionService = (): SecretEncryptionService =>
  ({
    decryptVersioned: jest.fn((value: string) => unwrapPlaintext(value)),
    encryptVersioned: jest.fn((plaintext: string) =>
      wrapAsInstanceV2(plaintext),
    ),
  }) as unknown as SecretEncryptionService;

describe('EncryptSensitiveConfigStorageSlowInstanceCommand', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('runDataMigration', () => {
    it('migrates only rows for sensitive STRING config keys', async () => {
      const sensitivePlaintext = 'legacy-secret';
      const nonSensitivePlaintext = 'plain-config-value';

      const rows: KeyValuePairEntity[] = [
        {
          id: 'aaaaaaaa-0000-0000-0000-000000000001',
          type: KeyValuePairType.CONFIG_VARIABLE,
          key: 'SENSITIVE_API_KEY',
          value: sensitivePlaintext as unknown as JSON,
          userId: null,
          workspaceId: null,
        } as KeyValuePairEntity,
        {
          id: 'bbbbbbbb-0000-0000-0000-000000000002',
          type: KeyValuePairType.CONFIG_VARIABLE,
          key: 'NON_SENSITIVE_FLAG',
          value: nonSensitivePlaintext as unknown as JSON,
          userId: null,
          workspaceId: null,
        } as KeyValuePairEntity,
        {
          id: 'cccccccc-0000-0000-0000-000000000003',
          type: KeyValuePairType.CONFIG_VARIABLE,
          key: 'SENSITIVE_API_KEY',
          value: wrapAsInstanceV2('already-v2') as unknown as JSON,
          userId: null,
          workspaceId: null,
        } as KeyValuePairEntity,
      ];

      const repository = buildFakeRepository(rows);
      const dataSource = buildFakeDataSource(repository);
      const encryption = buildFakeSecretEncryptionService();

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValue({
        SENSITIVE_API_KEY: {
          isSensitive: true,
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Sensitive string',
        },
        NON_SENSITIVE_FLAG: {
          isSensitive: false,
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Non-sensitive flag',
        },
      });

      await new EncryptSensitiveConfigStorageSlowInstanceCommand(
        encryption,
      ).runDataMigration(dataSource);

      // SENSITIVE_API_KEY row 1 was plaintext → re-encrypted.
      expect(rows[0].value).toBe(wrapAsInstanceV2(sensitivePlaintext));
      // NON_SENSITIVE_FLAG row was never inspected.
      expect(rows[1].value).toBe(nonSensitivePlaintext as unknown as JSON);
      // SENSITIVE_API_KEY row 3 was already v2 → untouched.
      expect(rows[2].value).toBe(
        wrapAsInstanceV2('already-v2') as unknown as JSON,
      );

      // Instance-scoped: encryptVersioned is called without workspaceId.
      expect(encryption.encryptVersioned).toHaveBeenCalledWith(
        sensitivePlaintext,
      );
      expect(encryption.encryptVersioned).toHaveBeenCalledTimes(1);
    });

    it('is a no-op when no sensitive STRING config keys are declared', async () => {
      const rows: KeyValuePairEntity[] = [];
      const repository = buildFakeRepository(rows);
      const dataSource = buildFakeDataSource(repository);
      const encryption = buildFakeSecretEncryptionService();

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValue({
        SOME_NON_SENSITIVE: {
          isSensitive: false,
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: '',
        },
      });

      await new EncryptSensitiveConfigStorageSlowInstanceCommand(
        encryption,
      ).runDataMigration(dataSource);

      expect(repository.find).not.toHaveBeenCalled();
      expect(encryption.encryptVersioned).not.toHaveBeenCalled();
    });
  });
});
