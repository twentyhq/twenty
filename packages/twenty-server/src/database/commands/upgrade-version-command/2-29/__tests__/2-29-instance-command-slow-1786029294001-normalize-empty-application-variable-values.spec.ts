import { type DataSource } from 'typeorm';

import { NormalizeEmptyApplicationVariableValuesSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-29/2-29-instance-command-slow-1786029294001-normalize-empty-application-variable-values';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const wrapAsV2 = (plaintext: string): string =>
  `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}deadbeef:CIPHER(${plaintext})`;

const UNDECRYPTABLE_VALUE = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}deadbeef:GARBAGE`;

const buildDataSource = (selectBatches: unknown[][]) => {
  const query = jest.fn(async (sql: string) =>
    sql.includes('SELECT') ? (selectBatches.shift() ?? []) : [],
  );

  return { dataSource: { query } as unknown as DataSource, query };
};

const normalizedIds = (query: jest.Mock): string[] =>
  query.mock.calls
    .filter(([sql]) => sql.includes('UPDATE'))
    .flatMap(([, params]) => params[0]);

const normalizedCiphertexts = (query: jest.Mock): string[] =>
  query.mock.calls
    .filter(([sql]) => sql.includes('UPDATE'))
    .flatMap(([, params]) => params[1]);

describe('NormalizeEmptyApplicationVariableValuesSlowInstanceCommand', () => {
  const secretEncryptionService = {
    decryptVersionedOrThrow: jest.fn((value: string) => {
      const match = new RegExp(
        `^${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}[0-9a-f]+:CIPHER\\((.*)\\)$`,
      ).exec(value);

      if (match === null) {
        throw new Error('undecryptable');
      }

      return match[1];
    }),
  } as unknown as SecretEncryptionService;

  const command =
    new NormalizeEmptyApplicationVariableValuesSlowInstanceCommand(
      secretEncryptionService,
    );

  it('should normalize only the envelopes that decrypt to an empty string', async () => {
    const { dataSource, query } = buildDataSource([
      [
        { id: 'a', encryptedValue: wrapAsV2('') },
        { id: 'b', encryptedValue: wrapAsV2('real-secret') },
      ],
      [],
      [{ id: 'd', encryptedValue: wrapAsV2(''), workspaceId: 'workspace-1' }],
      [],
    ]);

    await command.runDataMigration(dataSource);

    expect(normalizedIds(query)).toEqual(['a', 'd']);
  });

  it('should decrypt workspace-scoped rows with their workspace context', async () => {
    const { dataSource } = buildDataSource([
      [],
      [{ id: 'd', encryptedValue: wrapAsV2(''), workspaceId: 'workspace-1' }],
      [],
    ]);

    await command.runDataMigration(dataSource);

    expect(secretEncryptionService.decryptVersionedOrThrow).toHaveBeenCalledWith(
      wrapAsV2(''),
      { workspaceId: 'workspace-1' },
    );
  });

  it('should match on the decrypted ciphertext so a concurrent write is not clobbered', async () => {
    const { dataSource, query } = buildDataSource([
      [{ id: 'a', encryptedValue: wrapAsV2('') }],
      [],
      [],
    ]);

    await command.runDataMigration(dataSource);

    expect(normalizedCiphertexts(query)).toEqual([wrapAsV2('')]);
    expect(
      query.mock.calls.find(([sql]) => sql.includes('UPDATE'))?.[0],
    ).toContain('stale');
  });

  it('should skip rows that cannot be decrypted', async () => {
    const { dataSource, query } = buildDataSource([
      [{ id: 'a', encryptedValue: UNDECRYPTABLE_VALUE }],
      [],
      [],
    ]);

    await command.runDataMigration(dataSource);

    expect(normalizedIds(query)).toEqual([]);
  });
});
