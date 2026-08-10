import { type DataSource } from 'typeorm';

import { NormalizeEmptyApplicationVariableValuesSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-30/2-30-instance-command-slow-1786029294001-normalize-empty-application-variable-values';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const wrapAsV2 = (plaintext: string): string =>
  `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}deadbeef:CIPHER(${plaintext})`;

const UNDECRYPTABLE_VALUE = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}deadbeef:GARBAGE`;

type RegistrationVariableRow = { id: string; encryptedValue: string };

type ApplicationVariableRow = { id: string; value: string; workspaceId: string };

const matchesLikePattern = (value: string, pattern: string): boolean => {
  const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');
  const expression = escaped.replace(/%/g, '.*').replace(/_/g, '.');

  return new RegExp(`^${expression}$`).test(value);
};

const buildFakeDataSource = ({
  registrationVariableRows = [],
  applicationVariableRows = [],
}: {
  registrationVariableRows?: RegistrationVariableRow[];
  applicationVariableRows?: ApplicationVariableRow[];
} = {}) => {
  const sortedRegistrationVariableRows = [...registrationVariableRows].sort(
    (a, b) => a.id.localeCompare(b.id),
  );
  const sortedApplicationVariableRows = [...applicationVariableRows].sort(
    (a, b) => a.id.localeCompare(b.id),
  );
  let registrationVariableSelectCount = 0;

  const query = jest.fn(async (sql: string, params: unknown[] = []) => {
    const isRegistrationVariableTable = sql.includes(
      '"core"."applicationRegistrationVariable"',
    );

    if (sql.trimStart().startsWith('SELECT')) {
      const [cursor, likePattern, limit] = params as [string, string, number];

      if (isRegistrationVariableTable) {
        registrationVariableSelectCount++;

        return sortedRegistrationVariableRows
          .filter((row) => row.id > cursor)
          .filter((row) => matchesLikePattern(row.encryptedValue, likePattern))
          .slice(0, limit)
          .map(({ id, encryptedValue }) => ({ id, encryptedValue }));
      }

      return sortedApplicationVariableRows
        .filter((row) => row.id > cursor)
        .filter((row) => matchesLikePattern(row.value, likePattern))
        .slice(0, limit)
        .map(({ id, value, workspaceId }) => ({
          id,
          encryptedValue: value,
          workspaceId,
        }));
    }

    const [ids, encryptedValues] = params as [string[], string[]];
    let normalizedCount = 0;

    ids.forEach((id, index) => {
      if (isRegistrationVariableTable) {
        const target = sortedRegistrationVariableRows.find(
          (row) => row.id === id,
        );

        if (target?.encryptedValue === encryptedValues[index]) {
          target.encryptedValue = '';
          normalizedCount++;
        }

        return;
      }

      const target = sortedApplicationVariableRows.find((row) => row.id === id);

      if (target?.value === encryptedValues[index]) {
        target.value = '';
        normalizedCount++;
      }
    });

    return [{ count: String(normalizedCount) }];
  });

  return {
    dataSource: { query } as unknown as DataSource,
    query,
    registrationVariableRows: sortedRegistrationVariableRows,
    applicationVariableRows: sortedApplicationVariableRows,
    registrationVariableSelectCount: () => registrationVariableSelectCount,
  };
};

const buildCommand = ({
  onDecrypt,
}: { onDecrypt?: (value: string) => void } = {}) => {
  const decryptVersionedOrThrow = jest.fn((value: string) => {
    onDecrypt?.(value);

    const match = new RegExp(
      `^${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}[0-9a-f]+:CIPHER\\((.*)\\)$`,
    ).exec(value);

    if (match === null) {
      throw new Error('undecryptable');
    }

    return match[1];
  });

  const command =
    new NormalizeEmptyApplicationVariableValuesSlowInstanceCommand({
      decryptVersionedOrThrow,
    } as unknown as SecretEncryptionService);

  return { command, decryptVersionedOrThrow };
};

const updateCallCount = (query: jest.Mock): number =>
  query.mock.calls.filter(
    ([sql]: [string]) => !sql.trimStart().startsWith('SELECT'),
  ).length;

describe('NormalizeEmptyApplicationVariableValuesSlowInstanceCommand', () => {
  it('normalizes only the envelopes that decrypt to an empty string, in both tables', async () => {
    const fake = buildFakeDataSource({
      registrationVariableRows: [
        { id: 'a', encryptedValue: wrapAsV2('') },
        { id: 'b', encryptedValue: wrapAsV2('real-secret') },
      ],
      applicationVariableRows: [
        { id: 'd', value: wrapAsV2(''), workspaceId: 'workspace-1' },
        {
          id: 'e',
          value: wrapAsV2('another-secret'),
          workspaceId: 'workspace-1',
        },
      ],
    });
    const { command } = buildCommand();

    await command.runDataMigration(fake.dataSource);

    expect(fake.registrationVariableRows).toEqual([
      { id: 'a', encryptedValue: '' },
      { id: 'b', encryptedValue: wrapAsV2('real-secret') },
    ]);
    expect(fake.applicationVariableRows).toEqual([
      { id: 'd', value: '', workspaceId: 'workspace-1' },
      {
        id: 'e',
        value: wrapAsV2('another-secret'),
        workspaceId: 'workspace-1',
      },
    ]);
  });

  it('decrypts each table with its own workspace context', async () => {
    const fake = buildFakeDataSource({
      registrationVariableRows: [{ id: 'a', encryptedValue: wrapAsV2('') }],
      applicationVariableRows: [
        { id: 'd', value: wrapAsV2(''), workspaceId: 'workspace-1' },
      ],
    });
    const { command, decryptVersionedOrThrow } = buildCommand();

    await command.runDataMigration(fake.dataSource);

    expect(decryptVersionedOrThrow).toHaveBeenCalledWith(wrapAsV2(''), {
      workspaceId: undefined,
    });
    expect(decryptVersionedOrThrow).toHaveBeenCalledWith(wrapAsV2(''), {
      workspaceId: 'workspace-1',
    });
  });

  it('does not clobber a row rewritten concurrently between the read and the update', async () => {
    const concurrentEnvelope = wrapAsV2('rotated-secret');
    const fake = buildFakeDataSource({
      registrationVariableRows: [{ id: 'a', encryptedValue: wrapAsV2('') }],
    });
    const { command } = buildCommand({
      onDecrypt: () => {
        fake.registrationVariableRows[0].encryptedValue = concurrentEnvelope;
      },
    });

    await command.runDataMigration(fake.dataSource);

    expect(fake.registrationVariableRows).toEqual([
      { id: 'a', encryptedValue: concurrentEnvelope },
    ]);
  });

  it('skips rows that cannot be decrypted', async () => {
    const fake = buildFakeDataSource({
      registrationVariableRows: [
        { id: 'a', encryptedValue: UNDECRYPTABLE_VALUE },
      ],
    });
    const { command, decryptVersionedOrThrow } = buildCommand();

    await command.runDataMigration(fake.dataSource);

    expect(decryptVersionedOrThrow).toHaveBeenCalledWith(
      UNDECRYPTABLE_VALUE,
      expect.anything(),
    );
    expect(fake.registrationVariableRows).toEqual([
      { id: 'a', encryptedValue: UNDECRYPTABLE_VALUE },
    ]);
    expect(updateCallCount(fake.query)).toBe(0);
  });

  it('is a no-op on a second run', async () => {
    const fake = buildFakeDataSource({
      registrationVariableRows: [{ id: 'a', encryptedValue: wrapAsV2('') }],
      applicationVariableRows: [
        { id: 'd', value: wrapAsV2(''), workspaceId: 'workspace-1' },
      ],
    });
    const { command } = buildCommand();

    await command.runDataMigration(fake.dataSource);

    const updateCallCountAfterFirstRun = updateCallCount(fake.query);

    await command.runDataMigration(fake.dataSource);

    expect(updateCallCount(fake.query)).toBe(updateCallCountAfterFirstRun);
    expect(fake.registrationVariableRows).toEqual([
      { id: 'a', encryptedValue: '' },
    ]);
    expect(fake.applicationVariableRows).toEqual([
      { id: 'd', value: '', workspaceId: 'workspace-1' },
    ]);
  });

  it('paginates past the backfill batch size', async () => {
    const fake = buildFakeDataSource({
      registrationVariableRows: Array.from({ length: 1100 }, (_, index) => ({
        id: `id-${String(index).padStart(4, '0')}`,
        encryptedValue: wrapAsV2(''),
      })),
    });
    const { command } = buildCommand();

    await command.runDataMigration(fake.dataSource);

    expect(
      fake.registrationVariableRows.every(
        ({ encryptedValue }) => encryptedValue === '',
      ),
    ).toBe(true);
    expect(updateCallCount(fake.query)).toBe(3);
    expect(fake.registrationVariableSelectCount()).toBe(4);
  });
});
