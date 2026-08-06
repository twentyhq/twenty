import { type DataSource } from 'typeorm';

import { NormalizeEmptyApplicationVariableValuesSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-28/2-28-instance-command-slow-1785942889001-normalize-empty-application-variable-values';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

type FakeRow = { id: string; value: string; workspaceId: string | null };

const FAKE_V2_KEY_ID = 'deadbeef';

const wrapAsV2 = (plaintext: string): string =>
  `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${FAKE_V2_KEY_ID}:CIPHER(${plaintext})`;

const UNDECRYPTABLE_VALUE = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${FAKE_V2_KEY_ID}:GARBAGE`;

const buildFakeDataSource = (
  rowsByTable: Record<string, FakeRow[]>,
): { dataSource: DataSource; rows: (tableName: string) => FakeRow[] } => {
  const tables = Object.fromEntries(
    Object.entries(rowsByTable).map(([tableName, rows]) => [
      tableName,
      [...rows].sort((a, b) => a.id.localeCompare(b.id)),
    ]),
  );

  const tableNameFromSql = (sql: string): string =>
    Object.keys(tables).find((tableName) =>
      sql.includes(`"core"."${tableName}"`),
    ) as string;

  const fakeDataSource = {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      const rows = tables[tableNameFromSql(sql)];

      if (sql.includes('SELECT id')) {
        const cursor = params?.[0] as string;

        return rows
          .filter((row) => row.id > cursor)
          .filter((row) => row.value.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX))
          .map(({ id, value, workspaceId }) => ({
            id,
            encryptedValue: value,
            workspaceId,
          }));
      }

      const targetRow = rows.find((row) => row.id === params?.[0]);

      if (targetRow) {
        targetRow.value = '';
      }

      return [];
    }),
  } as unknown as DataSource;

  return {
    dataSource: fakeDataSource,
    rows: (tableName: string) => tables[tableName],
  };
};

describe('NormalizeEmptyApplicationVariableValuesSlowInstanceCommand', () => {
  const secretEncryptionService = {
    decryptVersionedOrThrow: jest.fn((value: string) => {
      const match = /^enc:v2:[0-9a-f]+:CIPHER\((.*)\)$/.exec(value);

      if (match === null) {
        throw new Error('undecryptable');
      }

      return match[1];
    }),
  } as unknown as SecretEncryptionService;

  const command = new NormalizeEmptyApplicationVariableValuesSlowInstanceCommand(
    secretEncryptionService,
  );

  it('should rewrite envelopes that decrypt to an empty string and leave the rest untouched', async () => {
    const { dataSource, rows } = buildFakeDataSource({
      applicationRegistrationVariable: [
        { id: 'a', value: wrapAsV2(''), workspaceId: null },
        { id: 'b', value: wrapAsV2('real-secret'), workspaceId: null },
        { id: 'c', value: '', workspaceId: null },
      ],
      applicationVariable: [
        { id: 'd', value: wrapAsV2(''), workspaceId: 'workspace-1' },
        { id: 'e', value: wrapAsV2('kept'), workspaceId: 'workspace-1' },
      ],
    });

    await command.runDataMigration(dataSource);

    expect(rows('applicationRegistrationVariable')).toEqual([
      { id: 'a', value: '', workspaceId: null },
      { id: 'b', value: wrapAsV2('real-secret'), workspaceId: null },
      { id: 'c', value: '', workspaceId: null },
    ]);
    expect(rows('applicationVariable')).toEqual([
      { id: 'd', value: '', workspaceId: 'workspace-1' },
      { id: 'e', value: wrapAsV2('kept'), workspaceId: 'workspace-1' },
    ]);
  });

  it('should decrypt workspace-scoped rows with their workspace context', async () => {
    const { dataSource } = buildFakeDataSource({
      applicationRegistrationVariable: [],
      applicationVariable: [
        { id: 'd', value: wrapAsV2(''), workspaceId: 'workspace-1' },
      ],
    });

    await command.runDataMigration(dataSource);

    expect(secretEncryptionService.decryptVersionedOrThrow).toHaveBeenCalledWith(
      wrapAsV2(''),
      { workspaceId: 'workspace-1' },
    );
  });

  it('should skip rows that cannot be decrypted', async () => {
    const { dataSource, rows } = buildFakeDataSource({
      applicationRegistrationVariable: [
        { id: 'a', value: UNDECRYPTABLE_VALUE, workspaceId: null },
      ],
      applicationVariable: [],
    });

    await command.runDataMigration(dataSource);

    expect(rows('applicationRegistrationVariable')[0].value).toBe(
      UNDECRYPTABLE_VALUE,
    );
  });
});
